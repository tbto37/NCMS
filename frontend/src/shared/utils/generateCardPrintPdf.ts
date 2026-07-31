import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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

// 로고 URL을 100% 캔버스 캡처 호환용 Base64 Data URL로 변환
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
 * 미리보기 화면과 100% 동일한 300DPI 초고화질 90mm x 50mm 인쇄용 PDF 생성 및 자동 다운로드
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

  // 오프스크린 렌더링 컨테이너 (인쇄 마진 92mm x 52mm 비율: 530.533px * 299.866px)
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

    // --- Page 1: 앞면 (국문 - 92mm x 52mm) ---
    const frontLogoBase64 = await fetchLogoBase64(specGroup.front.logoUrl);
    container.innerHTML = createSvgMarkup(key, specGroup.front, cardData, false, frontLogoBase64);
    await new Promise((res) => setTimeout(res, 100));
    
    // 300 DPI 초고화질 (scale: 4)
    const frontCanvas = await html2canvas(container, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const frontImgData = frontCanvas.toDataURL("image/png", 1.0);
    doc.addImage(frontImgData, "PNG", 0, 0, 92, 52);

    // --- Page 2: 뒷면 (영문 - 92mm x 52mm) ---
    doc.addPage([92, 52], "landscape");
    const backLogoBase64 = await fetchLogoBase64(specGroup.back.logoUrl);
    container.innerHTML = createSvgMarkup(key, specGroup.back, cardData, true, backLogoBase64);
    await new Promise((res) => setTimeout(res, 100));

    const backCanvas = await html2canvas(container, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const backImgData = backCanvas.toDataURL("image/png", 1.0);
    doc.addImage(backImgData, "PNG", 0, 0, 92, 52);

    // 파일 다운로드
    const orderNo = order.orderNo || order.id || "ORDER";
    const name = order.recipientName || order.name || "명함";
    const filename = `NCMS_명함인쇄_${orderNo}_${name}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    alert("인쇄용 PDF 생성 중 오류가 발생했습니다.");
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

  // 미리보기(SvgBusinessCardPreview)와 100% 동일한 로고 사양 및 좌표 적용
  const logoSpec = config.logoSpec || {
    x: key === "cheil" ? 35 : 30,
    y: key === "cheil" ? 42 : 48,
    width: key === "cheil" ? 145 : 150,
    height: 50,
  };

  // 도련(Bleed) 마진을 바깥으로 연장하여 재단 시 흰색 칼선 잔상 완벽 방지
  const bottomBarHtml = config.showBottomBar
    ? key === "cheil"
      ? `<rect x="-10" y="278" width="550" height="25" fill="#003876" /><rect x="-10" y="278" width="88" height="25" fill="#55b936" />`
      : `<rect x="-10" y="283" width="550" height="20" fill="#004B96" />`
    : "";

  const sloganHtml = config.showSlogan
    ? `<text x="35" y="236" font-size="12.5" font-weight="700" font-style="italic" fill="#0f172a" font-family="Georgia, serif" dominant-baseline="hanging">${config.sloganText || "“Smiling Technology”"}</text>`
    : "";

  const nameText = !isBack
    ? formatKoreanName(front.name) || "홍    길    동"
    : back.name || "Brad Hong";

  const deptPosText = !isBack
    ? key === "cheil"
      ? [front.department, front.position1].filter(Boolean).join(" / ") || "도로사업부 / 이사"
      : [front.position1, front.department].filter(Boolean).join(" / ") || "시니어 매니저 / 비즈니스개발실"
    : "";

  const companyText = !isBack
    ? key === "cheil"
      ? "(주)제일엔지니어링"
      : "한미글로벌 주식회사"
    : key === "cheil"
    ? "CHEIL ENGINEERING CO.,LTD."
    : "HanmiGlobal Co.,Ltd.";

  return `
    <svg viewBox="-5.767 -5.767 530.533 299.866" width="530.533" height="299.866" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Pretendard Variable', Pretendard, -apple-system, sans-serif; display:block;">
      ${bottomBarHtml}
      ${logoBase64 ? `<image href="${logoBase64}" x="${logoSpec.x}" y="${logoSpec.y}" width="${logoSpec.width}" height="${logoSpec.height}" preserveAspectRatio="xMinYMin meet" />` : ""}
      ${sloganHtml}

      ${config.fields.name ? `<text x="${config.fields.name.x}" y="${config.fields.name.y}" font-size="${config.fields.name.fontSize}" font-weight="${config.fields.name.fontWeight || "700"}" fill="${config.fields.name.fill || "#0f172a"}" letter-spacing="${!isBack && key === "cheil" ? "0.35em" : !isBack ? "0.25em" : "normal"}" dominant-baseline="hanging">${nameText}</text>` : ""}

      ${!isBack && config.fields.departmentPosition ? `<text x="${config.fields.departmentPosition.x}" y="${config.fields.departmentPosition.y}" font-size="${config.fields.departmentPosition.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${deptPosText}</text>` : ""}

      ${isBack && config.fields.position1 ? `<text x="${config.fields.position1.x}" y="${config.fields.position1.y}" font-size="${config.fields.position1.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${back.position1 || (key === "cheil" ? "Director / P.E." : "Senior Manager /")}</text>` : ""}

      ${isBack && config.fields.department ? `<text x="${config.fields.department.x}" y="${config.fields.department.y}" font-size="${config.fields.department.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${back.department || (key === "cheil" ? "Highway Eng. Business Div." : "Business Development Division")}</text>` : ""}

      ${config.fields.companyName ? `<text x="${config.fields.companyName.x}" y="${config.fields.companyName.y}" font-size="${config.fields.companyName.fontSize}" font-weight="700" fill="#0f172a" dominant-baseline="hanging">${companyText}</text>` : ""}

      ${key === "cheil" && config.fields.telAndFax ? `<text x="${config.fields.telAndFax.x}" y="${config.fields.telAndFax.y}" font-size="${config.fields.telAndFax.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `대표 : ${currentData.telephone || "02-3498-2600"}   팩스 : ${currentData.fax || "02-572-8970"}` : `Tel: ${currentData.telephone || "82-2-3498-2600"}   Fax: ${currentData.fax || "82-2-572-8970"}`}</text>` : ""}

      ${key === "hanmi" && config.fields.telephone ? `<text x="${config.fields.telephone.x}" y="${config.fields.telephone.y}" font-size="${config.fields.telephone.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging"><tspan font-weight="700" fill="#0f172a">T </tspan>${currentData.telephone || "+82(0)70-0000-0000"}</text>` : ""}

      ${config.fields.mobile ? `<text x="${config.fields.mobile.x}" y="${config.fields.mobile.y}" font-size="${config.fields.mobile.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `핸드폰 : ${currentData.mobile || "010-1234-5678"}` : `Mobile: ${currentData.mobile || "82-10-1234-5678"}`) : `<tspan font-weight="700" fill="#0f172a">M </tspan>${currentData.mobile || "+82(0)10-0000-0000"}`}</text>` : ""}

      ${config.fields.email ? `<text x="${config.fields.email.x}" y="${config.fields.email.y}" font-size="${config.fields.email.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? `E-mail: ${currentData.email || "youremail@email.com"}` : `<tspan font-weight="700" fill="#0f172a">E </tspan>${currentData.email || "logcom2@hanmiglobal.com"}`}</text>` : ""}

      ${config.fields.website ? `<text x="${config.fields.website.x}" y="${config.fields.website.y}" font-size="${config.fields.website.fontSize}" font-weight="700" fill="#004B96" dominant-baseline="hanging">${currentData.website || (key === "cheil" ? "www.cheileng.com" : "www.hanmiglobal.com")}</text>` : ""}

      ${key === "hanmi" && !isBack ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">06164, 서울시 강남구 테헤란로 87길</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">36 도심공항타워</text>
      ` : ""}

      ${key === "cheil" && !isBack ? `
        <text x="${config.fields.address?.x}" y="${config.fields.address?.y}" font-size="${config.fields.address?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address || "06779 서울시 서초구 강남대로16길 22-6(양재동)"}</text>
      ` : ""}

      ${isBack && key === "cheil" ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address1 || "22-6, Gangnamdaero 16gil, Seocho-gu,"}</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${back.address2 || "Seoul, Korea (06779)"}</text>
      ` : ""}

      ${isBack && key === "hanmi" ? `
        <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">City Air Tower Bldg., 36, Teheran-ro</text>
        <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">87-gil, Gangnam-gu, Seoul, 06164,</text>
        <text x="${config.fields.address3?.x}" y="${config.fields.address3?.y}" font-size="${config.fields.address3?.fontSize}" fill="#334155" dominant-baseline="hanging">Korea</text>
      ` : ""}
    </svg>
  `;
}
