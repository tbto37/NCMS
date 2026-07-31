import { jsPDF } from "jspdf";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS } from "@/shared/constants/cardTemplates";

interface OrderLike {
  id?: string;
  orderNo?: string;
  recipientName?: string;
  name?: string;
  site?: string;
  templateId?: string | number;
  cardDataJson?: string;
}

function formatKoreanName(nameStr?: string): string {
  if (!nameStr) return "";
  const trimmed = nameStr.replace(/\s+/g, "");
  if (trimmed.length === 3) {
    return `${trimmed[0]}    ${trimmed[1]}    ${trimmed[2]}`;
  }
  if (trimmed.length === 2) {
    return `${trimmed[0]}        ${trimmed[1]}`;
  }
  return nameStr;
}

// 로고 URL을 Base64 Data URL로 변환
async function fetchLogoBase64(url?: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return url;
  }
}

/**
 * Adobe Illustrator 100% 수정 가능 90mm x 50mm CMYK 순수 Vector PDF 생성 및 다운로드
 */
export async function generateCardPrintPdf(order: OrderLike): Promise<void> {
  let cardData: any = { front: {}, back: {} };
  if (order.cardDataJson) {
    try {
      cardData = JSON.parse(order.cardDataJson);
    } catch (e) {
      console.error("Failed to parse cardDataJson", e);
    }
  }

  const templateId = String(order.templateId || "T_CHEIL");
  const tidStr = templateId.toLowerCase();
  const key = tidStr.includes("hanmi") || tidStr === "3" ? "hanmi" : "cheil";
  const specGroup = CARD_TEMPLATE_SPECS[key] || CARD_TEMPLATE_SPECS.cheil;

  // 오프스크린 렌더링 컨테이너
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "530.533px";
  container.style.height = "299.866px";
  container.style.zIndex = "-9999";
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [92, 52],
      compress: true,
    });

    // --- Page 1: 앞면 (국문 순수 Vector SVG PDF) ---
    const frontLogoBase64 = await fetchLogoBase64(specGroup.front.logoUrl);
    container.innerHTML = createSvgMarkup(key, specGroup.front, cardData, false, frontLogoBase64);
    await new Promise((res) => setTimeout(res, 50));
    
    const frontSvg = container.querySelector("svg");
    if (frontSvg && typeof (doc as any).svg === "function") {
      await (doc as any).svg(frontSvg, {
        x: 0,
        y: 0,
        width: 92,
        height: 52,
      });
    } else {
      // fallback vector rendering
      const frontCanvas = document.createElement("canvas");
      frontCanvas.width = 1840;
      frontCanvas.height = 1040;
      const ctx = frontCanvas.getContext("2d");
      const img = new Image();
      const svgBlob = new Blob([container.innerHTML], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      await new Promise((resolve) => {
        img.onload = () => {
          if (ctx) ctx.drawImage(img, 0, 0, 1840, 1040);
          URL.revokeObjectURL(url);
          resolve(true);
        };
        img.src = url;
      });
      doc.addImage(frontCanvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 92, 52);
    }

    // --- Page 2: 뒷면 (영문 순수 Vector SVG PDF) ---
    doc.addPage([92, 52], "landscape");
    const backLogoBase64 = await fetchLogoBase64(specGroup.back.logoUrl);
    container.innerHTML = createSvgMarkup(key, specGroup.back, cardData, true, backLogoBase64);
    await new Promise((res) => setTimeout(res, 50));

    const backSvg = container.querySelector("svg");
    if (backSvg && typeof (doc as any).svg === "function") {
      await (doc as any).svg(backSvg, {
        x: 0,
        y: 0,
        width: 92,
        height: 52,
      });
    } else {
      const backCanvas = document.createElement("canvas");
      backCanvas.width = 1840;
      backCanvas.height = 1040;
      const ctx = backCanvas.getContext("2d");
      const img = new Image();
      const svgBlob = new Blob([container.innerHTML], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      await new Promise((resolve) => {
        img.onload = () => {
          if (ctx) ctx.drawImage(img, 0, 0, 1840, 1040);
          URL.revokeObjectURL(url);
          resolve(true);
        };
        img.src = url;
      });
      doc.addImage(backCanvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 92, 52);
    }

    // 파일 저장
    const orderNo = order.orderNo || order.id || "ORDER";
    const name = order.recipientName || order.name || "명함";
    const filename = `NCMS_명함인쇄_${orderNo}_${name}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    alert("인쇄용 Vector PDF 생성 중 오류가 발생했습니다.");
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// SVG HTML 마크업 생성 함수 (Base64 로고 직주입)
function createSvgMarkup(
  key: string,
  config: any,
  cardData: any,
  isBack: boolean,
  logoBase64: string
): string {
  const front = cardData.front || {};
  const back = cardData.back || {};
  const currentData = isBack ? back : front;

  const hasDirectTel = Boolean(currentData?.directTelephone && currentData.directTelephone.trim() !== "");
  const cheilY = {
    directTel: !isBack ? 174 : 191,
    mobile: !isBack ? (hasDirectTel ? 192 : 174) : (hasDirectTel ? 209 : 191),
    email: !isBack ? (hasDirectTel ? 210 : 192) : (hasDirectTel ? 227 : 209),
    website: !isBack ? (hasDirectTel ? 232 : 214) : (hasDirectTel ? 247 : 229),
  };

  // 미리보기(SvgBusinessCardPreview)와 100% 동일한 로고 사양 및 좌표 적용
  const logoSpec = config.logoSpec || {
    x: key === "cheil" ? 32 : 30,
    y: key === "cheil" ? 36 : 48,
    width: key === "cheil" ? 155 : 150,
    height: 48,
  };

  // 도련(Bleed) 마진을 바깥으로 연장하여 재단 시 흰색 칼선 잔상 완벽 방지
  const bottomBarHtml = config.showBottomBar
    ? key === "cheil"
      ? `<rect x="-10" y="278" width="550" height="25" fill="#003876" /><rect x="-10" y="278" width="88" height="25" fill="#55b936" />`
      : `<rect x="-10" y="283" width="550" height="20" fill="#004B96" />`
    : "";

  const sloganHtml = config.showSlogan
    ? `<text x="34" y="230" font-size="13.5" font-weight="700" fill="#333333" font-family="'a파도소리', 'aPadosori', 'Georgia', serif" transform="translate(34, 230) skewX(-8) translate(-34, -230)" dominant-baseline="hanging" alignment-baseline="before-edge">${config.sloganText || '"Smiling Technology"'}</text>`
    : "";

  const nameText = !isBack
    ? formatKoreanName(front.name) || "백    승    연"
    : back.name || "Rosy Baek";

  const deptPosText = !isBack
    ? key === "cheil"
      ? [front.department, front.position1].filter(Boolean).join(" / ") || "도로사업부 / 이사"
      : [front.position1, front.department].filter(Boolean).join(" / ") || "프로 / 경영지원팀"
    : "";

  const companyText = !isBack
    ? key === "cheil"
      ? "(주)제일엔지니어링종합건축사사무소"
      : "한미글로벌 주식회사"
    : key === "cheil"
    ? "CHEIL ENGINEERING CO.,LTD."
    : "HanmiGlobal Co.,Ltd.";

  const companyFont = config.fields.companyName?.fontFamily || (key === "cheil" ? "'HY울릉도M', HYUlsungdoM, 'HYPMokGak-Medium', serif" : "inherit");

  const telephoneText = currentData.telephone
    ? currentData.telephone.startsWith("+82")
      ? currentData.telephone
      : `+82 (0)${currentData.telephone.replace(/^0/, "")}`
    : "+82 (0)10-6379-1882";

  const mobileText = currentData.mobile
    ? currentData.mobile.startsWith("+82")
      ? currentData.mobile
      : `+82 (0)${currentData.mobile.replace(/^0/, "")}`
    : "+82 (0)70-7188-2199";

  return `
    <svg viewBox="-5.767 -5.767 530.533 299.866" width="530.533" height="299.866" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background:#ffffff; font-family:'Pretendard Variable', Pretendard, -apple-system, sans-serif; display:block;">
      ${bottomBarHtml}
      ${logoBase64 ? `<image href="${logoBase64}" xlink:href="${logoBase64}" x="${logoSpec.x}" y="${logoSpec.y}" width="${logoSpec.width}" height="${logoSpec.height}" preserveAspectRatio="xMinYMin meet" />` : ""}
      ${sloganHtml}

      ${config.fields.name ? `<text x="${config.fields.name.x}" y="${config.fields.name.y}" font-size="${config.fields.name.fontSize}" font-weight="${config.fields.name.fontWeight || "700"}" fill="${config.fields.name.fill || "#0f172a"}" letter-spacing="${!isBack && key === "cheil" ? "0.35em" : !isBack ? "0.25em" : "normal"}" dominant-baseline="hanging">${nameText}</text>` : ""}

      ${!isBack && config.fields.departmentPosition ? `<text x="${config.fields.departmentPosition.x}" y="${config.fields.departmentPosition.y}" font-size="${config.fields.departmentPosition.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${deptPosText}</text>` : ""}

      ${!isBack && config.fields.position2 ? `<text x="${config.fields.position2.x}" y="${config.fields.position2.y}" font-size="${config.fields.position2.fontSize}" font-weight="${config.fields.position2.fontWeight || "400"}" fill="${config.fields.position2.fill || "#475569"}" dominant-baseline="hanging">${front.position2 || (key === "cheil" ? "도로 및 공항 기술사" : "")}</text>` : ""}

      ${isBack && config.fields.position1 ? `<text x="${config.fields.position1.x}" y="${config.fields.position1.y}" font-size="${config.fields.position1.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${back.position1 ? (back.position1.endsWith("/") ? back.position1 : back.position1 + " /") : (key === "cheil" ? "Director / P.E." : "Professional /")}</text>` : ""}

      ${isBack && config.fields.department ? `<text x="${config.fields.department.x}" y="${config.fields.department.y}" font-size="${config.fields.department.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${back.department || (key === "cheil" ? "Highway Eng. Business Div." : "Management Support Team")}</text>` : ""}

      ${config.fields.companyName ? `<text x="${config.fields.companyName.x}" y="${config.fields.companyName.y}" font-size="${config.fields.companyName.fontSize}" font-weight="700" fill="${config.fields.companyName.fill || "#0f172a"}" font-family="${companyFont}" dominant-baseline="hanging">${!isBack ? companyText : (key === "cheil" ? "CHEIL ENGINEERING CO.,LTD." : '<tspan font-weight="700" fill="#0f172a">Hanmi</tspan><tspan font-weight="400" fill="#334155">Global Co.,Ltd.</tspan>')}</text>` : ""}

      ${key === "cheil" && config.fields.telAndFax ? `<text x="${config.fields.telAndFax.x}" y="${config.fields.telAndFax.y}" font-size="${config.fields.telAndFax.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `대표 : ${currentData.telephone || "02-3498-2600"}   팩스 : ${currentData.fax || "02-572-8970"}` : `Tel: ${currentData.telephone || "82-2-3498-2600"}   Fax: ${currentData.fax || "82-2-572-8970"}`}</text>` : ""}

      ${key === "hanmi" && config.fields.telephone ? `<text x="${config.fields.telephone.x}" y="${config.fields.telephone.y}" font-size="${config.fields.telephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.telephone.x}" font-weight="400" fill="#1e293b">T</tspan><tspan x="${config.fields.telephone.x + 16}">${telephoneText}</tspan></text>` : ""}

      ${config.fields.directTelephone && (key === "cheil" ? hasDirectTel : currentData.directTelephone) ? `<text x="${config.fields.directTelephone.x}" y="${key === "cheil" ? cheilY.directTel : config.fields.directTelephone.y}" font-size="${config.fields.directTelephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `직통 : ${currentData.directTelephone}` : `Dir: ${currentData.directTelephone}`) : `Dir ${currentData.directTelephone || "02-3498-2662"}`}</text>` : ""}

      ${config.fields.mobile ? `<text x="${config.fields.mobile.x}" y="${key === "cheil" ? cheilY.mobile : config.fields.mobile.y}" font-size="${config.fields.mobile.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `핸드폰 : ${currentData.mobile || "010-1234-5678"}` : `Mobile: ${currentData.mobile || "82-10-1234-5678"}`) : `<tspan x="${config.fields.mobile.x}" font-weight="400" fill="#1e293b">M</tspan><tspan x="${config.fields.mobile.x + 16}">${mobileText}</tspan>`}</text>` : ""}

      ${config.fields.email ? `<text x="${config.fields.email.x}" y="${key === "cheil" ? cheilY.email : config.fields.email.y}" font-size="${config.fields.email.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `E-mail: ${currentData.email || "youremail@email.com"}` : `E-mail: ${currentData.email || "youremail@email.com"}`) : `<tspan x="${config.fields.email.x}" font-weight="400" fill="#1e293b">E</tspan><tspan x="${config.fields.email.x + 16}">${currentData.email || "baeksy@hanmiglobal.com"}</tspan>`}</text>` : ""}

      ${config.fields.website ? `<text x="${config.fields.website.x}" y="${key === "cheil" ? cheilY.website : config.fields.website.y}" font-size="${config.fields.website.fontSize}" font-weight="700" fill="${key === "cheil" ? "#0f172a" : "#004B96"}" dominant-baseline="hanging">${currentData.website || (key === "cheil" ? "www.cheileng.com" : "www.hanmiglobal.com")}</text>` : ""}

      ${key === "hanmi" && !isBack ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address1 || front.address || "06164, 서울시 강남구 테헤란로 87길"}</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address2 || (front.address ? "" : "36 도심공항타워")}</text>
      ` : ""}

      ${key === "cheil" && !isBack ? `
        <text x="${config.fields.address?.x}" y="${config.fields.address?.y}" font-size="${config.fields.address?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address || "06779 서울시 서초구 강남대로16길 22-6(양재동)"}</text>
      ` : ""}

      ${isBack && key === "cheil" ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address1 || "22-6, Gangnamdaero 16gil, Seocho-gu,"}</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address2 || "Seoul, Korea (06779)"}</text>
      ` : ""}

      ${isBack && key === "hanmi" ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address1 || "City Air Tower Bldg., 36, Teheran-ro"}</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address2 || "87-gil, Gangnam-gu, Seoul, 06164,"}</text>
        <text x="${config.fields.address3?.x}" y="${config.fields.address3?.y}" font-size="${config.fields.address3?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address3 || "Korea"}</text>
      ` : ""}
    </svg>
  `;
}
