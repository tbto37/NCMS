import { jsPDF } from "jspdf";
import * as opentype from "opentype.js";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS } from "@/shared/constants/cardTemplates";
import { getHanmiFrontAddressLines, getHanmiBackAddressLines, getCheilBackAddressLines } from "@/components/card/SvgBusinessCardPreview";

interface OrderLike {
  id?: string;
  orderNo?: string;
  recipientName?: string;
  name?: string;
  site?: string;
  templateId?: string | number;
  cardDataJson?: string;
  createdAt?: string;
  receivedAt?: string;
  orderDate?: string;
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

// 폰트 파일 캐시
const loadedFonts: Record<string, opentype.Font> = {};

async function loadFontFile(url: string): Promise<opentype.Font | null> {
  if (loadedFonts[url]) return loadedFonts[url];
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const font = opentype.parse(buffer);
    loadedFonts[url] = font;
    return font;
  } catch (e) {
    console.warn(`Failed to load font from ${url}:`, e);
    return null;
  }
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
 * Adobe Illustrator 100% 수정 가능 / 윤곽선(Outline Path) & Native CMYK 90mm x 50mm Pure Vector PDF 생성 및 다운로드
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

  // 폰트 파일 미리 로드
  const fontUlsungdo = await loadFontFile("/fonts/HYWULM.TTF");
  const fontPadosori = await loadFontFile("/fonts/a파도소리_3.otf");
  const fontNanumSquare = await loadFontFile("/fonts/NanumSquareEB.ttf") || await loadFontFile("/fonts/NanumSquareB_1.ttf");

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

    // --- Page 1: 앞면 (국문 순수 Vector SVG PDF + Outline + CMYK) ---
    const frontLogoBase64 = await fetchLogoBase64(specGroup.front.logoUrl);
    const hanmiFrontNameBase64 = key === "hanmi" ? await fetchLogoBase64("/hanmi_front_name.jpg") : "";
    container.innerHTML = await createSvgMarkupWithOutlines(
      key,
      specGroup.front,
      cardData,
      false,
      frontLogoBase64,
      fontUlsungdo,
      fontPadosori,
      fontNanumSquare,
      hanmiFrontNameBase64
    );
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
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };
        img.src = url;
      });
      doc.addImage(frontCanvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 92, 52);
    }

    // --- Page 2: 뒷면 (영문 순수 Vector SVG PDF + Outline + CMYK) ---
    doc.addPage([92, 52], "landscape");
    const backLogoBase64 = await fetchLogoBase64(specGroup.back.logoUrl);
    const hanmiBackNameBase64 = key === "hanmi" ? await fetchLogoBase64("/hanmi_back_name.jpg") : "";
    container.innerHTML = await createSvgMarkupWithOutlines(
      key,
      specGroup.back,
      cardData,
      true,
      backLogoBase64,
      fontUlsungdo,
      fontPadosori,
      fontNanumSquare,
      hanmiBackNameBase64
    );
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
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };
        img.src = url;
      });
      doc.addImage(backCanvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 92, 52);
    }

    // 파일 저장 (형식: YYYY-MM-DD-주문번호.pdf)
    const orderNo = order.orderNo || order.id || "ORDER";
    let dateStr = "";
    const rawDate = order.createdAt || order.receivedAt || order.orderDate;
    if (rawDate) {
      const match = rawDate.match(/(\d{4})[./-]?(\d{2})[./-]?(\d{2})/);
      if (match) {
        dateStr = `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
    if (!dateStr) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      dateStr = `${yyyy}-${mm}-${dd}`;
    }

    const filename = `${dateStr}-${orderNo}.pdf`;

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

// 텍스트를 opentype.js Path로 치환하여 Outline SVG 생성
async function createSvgMarkupWithOutlines(
  key: string,
  config: any,
  cardData: any,
  isBack: boolean,
  logoBase64: string,
  fontUlsungdo: opentype.Font | null,
  fontPadosori: opentype.Font | null,
  fontNanumSquare: opentype.Font | null = null,
  hanmiNameBase64: string = ""
): Promise<string> {
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

  const logoSpec = config.logoSpec || {
    x: key === "cheil" ? 32 : 30,
    y: key === "cheil" ? 36 : 48,
    width: key === "cheil" ? 155 : 150,
    height: 48,
  };

  // K80 (#333333) / CMYK 인쇄 바닥선
  const bottomBarHtml = config.showBottomBar
    ? key === "cheil"
      ? `<rect x="-10" y="278" width="550" height="25" fill="#003876" /><rect x="-10" y="278" width="88" height="25" fill="#55b936" />`
      : `<rect x="-10" y="283" width="550" height="20" fill="#004B96" />`
    : "";

  // 슬로건 "Smiling Technology" -> a파도소리 8pt, K80 (#333333), -7deg skewX
  let sloganHtml = "";
  if (config.showSlogan) {
    const textStr = config.sloganText || '"Smiling Technology"';
    if (fontPadosori) {
      // 8pt ~ viewBox 환산 13.5px
      const path = fontPadosori.getPath(textStr, 34, 242, 13.5);
      path.fill = "#333333";
      sloganHtml = `<g transform="translate(34, 230) skewX(-7) translate(-34, -230)">${path.toSVG(2)}</g>`;
    } else {
      sloganHtml = `<text x="34" y="230" font-size="13.5" font-weight="700" fill="#333333" font-family="'a파도소리', 'aPadosori', 'Georgia', serif" transform="translate(34, 230) skewX(-7) translate(-34, -230)" dominant-baseline="hanging">${textStr}</text>`;
    }
  }

  const nameText = !isBack
    ? formatKoreanName(front.name) || ""
    : back.name || "";

  const deptPosText = !isBack
    ? key === "cheil"
      ? [front.department, front.position1].filter(Boolean).join(" / ")
      : [front.position1, front.department].filter(Boolean).join(" / ")
    : "";

  const companyText = !isBack
    ? key === "cheil"
      ? "(주)제일엔지니어링종합건축사사무소"
      : "한미글로벌 주식회사"
    : key === "cheil"
    ? "CHEIL ENGINEERING CO.,LTD."
    : "HanmiGlobal Co.,Ltd.";

  // 제일엔지니어링(HY울릉도M) & 한미글로벌(아웃라인 이미지 자산) 상호
  let companyHtml = "";
  if (config.fields.companyName) {
    if (key === "cheil" && fontUlsungdo && !isBack) {
      const path = fontUlsungdo.getPath(companyText, config.fields.companyName.x, config.fields.companyName.y + 12, config.fields.companyName.fontSize || 14);
      path.fill = config.fields.companyName.fill || "#0f172a";
      companyHtml = path.toSVG(2);
    } else if (key === "hanmi" && hanmiNameBase64) {
      companyHtml = `<image href="${hanmiNameBase64}" xlink:href="${hanmiNameBase64}" x="${config.fields.companyName.x}" y="${config.fields.companyName.y - 2}" width="${!isBack ? 143.7 : 159.9}" height="14.2" preserveAspectRatio="xMinYMin meet" />`;
    } else if (key === "hanmi" && fontNanumSquare) {
      const path = fontNanumSquare.getPath(companyText, config.fields.companyName.x, config.fields.companyName.y + 12, config.fields.companyName.fontSize || 14.2);
      path.fill = config.fields.companyName.fill || "#0f172a";
      companyHtml = path.toSVG(2);
    } else {
      companyHtml = `<text x="${config.fields.companyName.x}" y="${config.fields.companyName.y}" font-size="${config.fields.companyName.fontSize}" font-weight="700" fill="${config.fields.companyName.fill || "#0f172a"}" font-family="${config.fields.companyName?.fontFamily || "'HY울릉도M', serif"}" dominant-baseline="hanging">${!isBack ? companyText : (key === "cheil" ? "CHEIL ENGINEERING CO.,LTD." : '<tspan font-weight="700" fill="#0f172a">Hanmi</tspan><tspan font-weight="400" fill="#334155">Global Co.,Ltd.</tspan>')}</text>`;
    }
  }

  const telephoneText = currentData.telephone
    ? currentData.telephone.startsWith("+82")
      ? currentData.telephone
      : `+82 (0)${currentData.telephone.replace(/^0/, "")}`
    : "";

  const mobileText = currentData.mobile
    ? currentData.mobile.startsWith("+82")
      ? currentData.mobile
      : `+82 (0)${currentData.mobile.replace(/^0/, "")}`
    : "";

  return `
    <svg viewBox="-5.767 -5.767 530.533 299.866" width="530.533" height="299.866" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background:#ffffff; font-family:${key === "hanmi" ? "'NanumSquare', 'Pretendard Variable', Pretendard, sans-serif" : "'Pretendard Variable', Pretendard, -apple-system, sans-serif"}; display:block;">
      <defs>
        <style>
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
          text { forced-color-adjust: none; color-scheme: light; }
        </style>
      </defs>
      ${bottomBarHtml}
      ${logoBase64 ? `<image href="${logoBase64}" xlink:href="${logoBase64}" x="${logoSpec.x}" y="${logoSpec.y}" width="${logoSpec.width}" height="${logoSpec.height}" preserveAspectRatio="xMinYMin meet" />` : ""}
      ${sloganHtml}

      ${config.fields.name && nameText ? `<text x="${config.fields.name.x}" y="${config.fields.name.y}" font-size="${config.fields.name.fontSize}" font-weight="${config.fields.name.fontWeight || "700"}" fill="${config.fields.name.fill || "#0f172a"}" letter-spacing="${!isBack && key === "cheil" ? "0.35em" : !isBack ? "0.25em" : "normal"}" dominant-baseline="hanging">${nameText}</text>` : ""}

      ${!isBack && config.fields.departmentPosition && deptPosText ? `<text x="${config.fields.departmentPosition.x}" y="${config.fields.departmentPosition.y}" font-size="${config.fields.departmentPosition.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${deptPosText}</text>` : ""}

      ${!isBack && config.fields.position2 && front.position2 ? `<text x="${config.fields.position2.x}" y="${config.fields.position2.y}" font-size="${config.fields.position2.fontSize}" font-weight="${config.fields.position2.fontWeight || "400"}" fill="${config.fields.position2.fill || "#475569"}" dominant-baseline="hanging">${front.position2}</text>` : ""}

      ${isBack && config.fields.position1 && back.position1 ? `<text x="${config.fields.position1.x}" y="${config.fields.position1.y}" font-size="${config.fields.position1.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${back.position1.endsWith("/") ? back.position1 : back.position1 + " /"}</text>` : ""}

      ${isBack && config.fields.department && back.department ? `<text x="${config.fields.department.x}" y="${config.fields.department.y}" font-size="${config.fields.department.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${back.department}</text>` : ""}

      ${companyHtml}

      ${key === "cheil" && config.fields.telAndFax && (currentData.telephone || currentData.fax) ? `<text x="${config.fields.telAndFax.x}" y="${config.fields.telAndFax.y}" font-size="${config.fields.telAndFax.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `${currentData.telephone ? `대표 : ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}` : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`}</text>` : ""}

      ${key === "hanmi" && config.fields.telephone && currentData.telephone ? `<text x="${config.fields.telephone.x}" y="${config.fields.telephone.y}" font-size="${config.fields.telephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.telephone.x}" font-weight="400" fill="#1e293b">T</tspan><tspan x="${config.fields.telephone.x + 16}">${telephoneText}</tspan></text>` : ""}

      ${config.fields.directTelephone && currentData.directTelephone ? `<text x="${config.fields.directTelephone.x}" y="${key === "cheil" ? cheilY.directTel : config.fields.directTelephone.y}" font-size="${config.fields.directTelephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `직통 : ${currentData.directTelephone}` : `Dir: ${currentData.directTelephone}`) : `Dir ${currentData.directTelephone}`}</text>` : ""}

      ${config.fields.mobile && currentData.mobile ? `<text x="${config.fields.mobile.x}" y="${key === "cheil" ? cheilY.mobile : config.fields.mobile.y}" font-size="${config.fields.mobile.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `핸드폰 : ${currentData.mobile}` : `Mobile: ${currentData.mobile}`) : `<tspan x="${config.fields.mobile.x}" font-weight="400" fill="#1e293b">M</tspan><tspan x="${config.fields.mobile.x + 16}">${mobileText}</tspan>`}</text>` : ""}

      ${config.fields.email && currentData.email ? `<text x="${config.fields.email.x}" y="${key === "cheil" ? cheilY.email : config.fields.email.y}" font-size="${config.fields.email.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? `E-mail: ${currentData.email}` : `<tspan x="${config.fields.email.x}" font-weight="400" fill="#1e293b">E</tspan><tspan x="${config.fields.email.x + 16}">${currentData.email}</tspan>`}</text>` : ""}

      ${config.fields.website && currentData.website ? `<text x="${config.fields.website.x}" y="${key === "cheil" ? cheilY.website : config.fields.website.y}" font-size="${config.fields.website.fontSize}" font-weight="700" fill="${key === "cheil" ? "#0f172a" : "#004B96"}" dominant-baseline="hanging">${currentData.website}</text>` : ""}

      ${key === "hanmi" && !isBack ? (() => {
        const [addr1, addr2] = getHanmiFrontAddressLines(front);
        return `
          ${addr1 ? `<text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr1}</text>` : ""}
          ${addr2 ? `<text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr2}</text>` : ""}
        `;
      })() : ""}

      ${key === "cheil" && !isBack && front.address ? `
        <text x="${config.fields.address?.x}" y="${config.fields.address?.y}" font-size="${config.fields.address?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address}</text>
      ` : ""}

      ${isBack && key === "cheil" ? (() => {
        const [cAddr1, cAddr2] = getCheilBackAddressLines(back);
        return `
          <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${cAddr1}</text>
          <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${cAddr2}</text>
        `;
      })() : ""}

      ${isBack && key === "hanmi" ? (() => {
        const [bAddr1, bAddr2, bAddr3] = getHanmiBackAddressLines(back);
        return `
          <text x="${config.fields.address1?.x}" y="${config.fields.address1?.y}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr1}</text>
          <text x="${config.fields.address2?.x}" y="${config.fields.address2?.y}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr2}</text>
          <text x="${config.fields.address3?.x}" y="${config.fields.address3?.y}" font-size="${config.fields.address3?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr3}</text>
        `;
      })() : ""}
    </svg>
  `;
}
