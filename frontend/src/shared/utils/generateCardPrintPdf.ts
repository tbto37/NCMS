import { jsPDF } from "jspdf";
import * as opentype from "opentype.js";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS } from "@/shared/constants/cardTemplates";
import { getHanmiFrontAddressLines, getHanmiBackAddressLines, getCheilBackAddressLines } from "@/components/card/SvgBusinessCardPreview";

interface OrderLike {
  id?: string;
  orderNo?: string;
  recipientName?: string;
  applicantName?: string;
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
    const cheilFrontAssetUrl = (tidStr === "4" || tidStr.includes("cheil_front_name"))
      ? "/cheil/cheil_front_name.jpg"
      : "/cheil/cheil_build_front_name.jpg";
    const companyNameFrontAssetBase64 = key === "hanmi"
      ? await fetchLogoBase64("/hanmi/hanmi_front_name.jpg")
      : await fetchLogoBase64(cheilFrontAssetUrl);
    const cheilSmileBase64 = key === "cheil" ? await fetchLogoBase64("/cheil/cheil_smile.jpg") : "";

    container.innerHTML = await createSvgMarkupWithOutlines(
      key,
      specGroup.front,
      cardData,
      false,
      frontLogoBase64,
      fontUlsungdo,
      fontPadosori,
      fontNanumSquare,
      companyNameFrontAssetBase64,
      cheilSmileBase64,
      tidStr
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

    const isSingleSided = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");

    if (!isSingleSided) {
      // --- Page 2: 뒷면 (영문 순수 Vector SVG PDF + Outline + CMYK) ---
      doc.addPage([92, 52], "landscape");
      const backLogoBase64 = await fetchLogoBase64(specGroup.back.logoUrl);
    const companyNameBackAssetBase64 = key === "hanmi"
      ? await fetchLogoBase64("/hanmi/hanmi_back_name.jpg")
      : await fetchLogoBase64("/cheil/cheil_back_name.jpg");

    container.innerHTML = await createSvgMarkupWithOutlines(
      key,
      specGroup.back,
      cardData,
      true,
      backLogoBase64,
      fontUlsungdo,
      fontPadosori,
      fontNanumSquare,
      companyNameBackAssetBase64,
      cheilSmileBase64,
      tidStr
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
  }

    // 파일 저장 (형식: YYYYMMDD-주문번호-고객사명(한미 혹은 제일)-이름.pdf)
    const orderNo = order.orderNo || order.id || "ORDER";
    let dateStr = "";
    const rawDate = order.createdAt || order.receivedAt || order.orderDate;
    if (rawDate) {
      const match = rawDate.match(/(\d{4})[./-]?(\d{2})[./-]?(\d{2})/);
      if (match) {
        dateStr = `${match[1]}${match[2]}${match[3]}`;
      }
    }
    if (!dateStr) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      dateStr = `${yyyy}${mm}${dd}`;
    }

    const companyLabel = key === "hanmi" ? "한미" : "제일";
    const nameStr = (cardData?.front?.name || order.recipientName || order.applicantName || "명함").trim().replace(/\s+/g, "");

    const filename = `${dateStr}-${orderNo}-${companyLabel}-${nameStr}.pdf`;

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
  companyNameAssetBase64: string = "",
  sloganAssetBase64: string = "",
  tidStr: string = ""
): Promise<string> {
  const front = cardData.front || {};
  const back = cardData.back || {};
  const currentData = isBack ? back : front;

  const isCheilOffice = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");

  // 하단 기준 동적 정렬 (Bottom-Up Stacking)
  // 입력된 텍스트 필드가 빠져있을 때 빈 공간 없이 아래 기준으로 차곡차곡 밀착 배치
  const cardY = (() => {
    if (isCheilOffice) {
      let currentY = 255;
      const res = {
        website: 255,
        email: 237,
        mobile: 219,
        directTel: 198,
        telAndFax: 201,
        fieldAddress: 183,
        address: 165,
        address1: 165,
        address2: 183,
        address3: 242,
        telephone: 201,
        companyName: 145,
      };
      const step = 18;
      res.website = currentY;

      if (front.email) {
        currentY -= step;
        res.email = currentY;
      }
      if (front.mobile) {
        currentY -= step;
        res.mobile = currentY;
      }
      if (front.telephone || front.fax) {
        currentY -= step;
        res.telAndFax = currentY;
      }
      if (front.fieldAddress) {
        currentY -= step;
        res.fieldAddress = currentY;
      }
      if (front.address) {
        currentY -= step;
        res.address = currentY;
      }
      currentY -= 20;
      res.companyName = currentY;
      return res;
    }

    if (key === "cheil") {
      let currentY = 255;
      const res = {
        website: 255,
        email: 236,
        mobile: 217,
        directTel: 198,
        telAndFax: 179,
        fieldAddress: 183,
        address: 160,
        address1: 153,
        address2: 170,
        address3: 242,
        telephone: 158,
        companyName: !isBack ? 141 : 136,
      };

      const step = !isBack ? 19 : 17;
      res.website = currentY;

      if (config.fields.email && currentData.email) {
        currentY -= step;
        res.email = currentY;
      }
      if (config.fields.mobile && currentData.mobile) {
        currentY -= step;
        res.mobile = currentY;
      }
      if (config.fields.directTelephone && currentData.directTelephone) {
        currentY -= step;
        res.directTel = currentY;
      }
      const hasTelAndFax = Boolean(
        config.fields.telAndFax && (currentData.telephone || currentData.fax)
      );
      if (hasTelAndFax) {
        currentY -= step;
        res.telAndFax = currentY;
      }
      if (!isBack) {
        if (config.fields.address && front.address) {
          currentY -= step;
          res.address = currentY;
        }
      } else {
        const [c1, c2] = getCheilBackAddressLines(back);
        if (c2) {
          currentY -= step;
          res.address2 = currentY;
        }
        if (c1) {
          currentY -= step;
          res.address1 = currentY;
        }
      }
      if (config.fields.companyName) {
        currentY -= step;
        res.companyName = currentY;
      }
      return res;
    }

    if (key === "hanmi") {
      if (!isBack) {
        // 한미글로벌 앞면 (국문): 최하단 주소 기준 Y = 236
        const [addr1, addr2] = getHanmiFrontAddressLines(front);
        const addr2Y = 236;
        const addr1Y = addr2 ? 218 : 236;

        let currentY = addr2 ? 218 : 236;
        const step = 19;

        let emailY = config.fields.email?.y || 196;
        if (config.fields.email && front.email) {
          currentY -= step;
          emailY = currentY;
        }

        let mobileY = config.fields.mobile?.y || 177;
        if (config.fields.mobile && front.mobile) {
          currentY -= step;
          mobileY = currentY;
        }

        let telephoneY = config.fields.telephone?.y || 158;
        if (config.fields.telephone && front.telephone) {
          currentY -= step;
          telephoneY = currentY;
        }

        let companyNameY = config.fields.companyName?.y || 136;
        if (config.fields.companyName) {
          currentY -= 22;
          companyNameY = currentY;
        }

        return {
          website: 255,
          email: emailY,
          mobile: mobileY,
          directTel: 198,
          telAndFax: 179,
          fieldAddress: 183,
          telephone: telephoneY,
          address: addr1Y,
          address1: addr1Y,
          address2: addr2Y,
          address3: 242,
          companyName: companyNameY,
        };
      } else {
        // 한미글로벌 뒷면 (영문): 최하단 주소 기준 Y = 242
        const [b1, b2, b3] = getHanmiBackAddressLines(back);
        const validLines = [b1, b2, b3].filter(Boolean);
        const lineCount = validLines.length || 1;

        const b3Y = 242;
        const b2Y = lineCount >= 3 ? 224 : (lineCount === 2 ? 242 : 242);
        const b1Y = lineCount === 3 ? 206 : (lineCount === 2 ? 224 : 242);

        let currentY = b1Y;

        let websiteY = config.fields.website?.y || 186;
        if (config.fields.website && back.website) {
          currentY -= 20;
          websiteY = currentY;
        }

        let companyNameY = config.fields.companyName?.y || 168;
        if (config.fields.companyName) {
          currentY -= 18;
          companyNameY = currentY;
        }

        return {
          website: websiteY,
          email: 236,
          mobile: 217,
          directTel: 198,
          telAndFax: 179,
          fieldAddress: 183,
          telephone: 158,
          address: b1Y,
          address1: b1Y,
          address2: b2Y,
          address3: b3Y,
          companyName: companyNameY,
        };
      }
    }

    return {
      website: 255,
      email: 236,
      mobile: 217,
      directTel: 198,
      telAndFax: 179,
      fieldAddress: 183,
      telephone: 158,
      address: 160,
      address1: 153,
      address2: 170,
      address3: 242,
      companyName: 141,
    };
  })();
  const cheilY = cardY;

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

  const sloganSpec = config.sloganSpec || {
    x: 35,
    y: 239,
    width: 152,
    height: 17.5,
  };

  // 슬로건 ("Smiling Technology" -> /cheil/cheil_smile.jpg 이미지 교체)
  let sloganHtml = "";
  if (config.showSlogan) {
    const src = sloganAssetBase64 || "/cheil/cheil_smile.jpg";
    sloganHtml = `<image href="${src}" xlink:href="${src}" x="${sloganSpec.x}" y="${sloganSpec.y}" width="${sloganSpec.width}" height="${sloganSpec.height}" preserveAspectRatio="xMinYMin meet" />`;
  }

  const nameText = !isBack
    ? formatKoreanName(front.name) || ""
    : back.name || "";

  const deptPosText = !isBack
    ? key === "cheil"
      ? [front.department, front.position1].filter(Boolean).join(" / ")
      : [front.position1, front.department].filter(Boolean).join(" / ")
    : "";

  // 제일엔지니어링 & 한미글로벌 지정 이미지 자산 상호명
  let companyHtml = "";
  if (config.fields.companyName) {
    if (key === "hanmi") {
      const src = companyNameAssetBase64 || (!isBack ? "/hanmi/hanmi_front_name.jpg" : "/hanmi/hanmi_back_name.jpg");
      companyHtml = `<image href="${src}" xlink:href="${src}" x="${config.fields.companyName.x}" y="${cardY.companyName}" width="${!isBack ? 143.7 : 159.9}" height="14.2" preserveAspectRatio="xMinYMin meet" />`;
    } else {
      const defaultCheilFront = (tidStr === "4" || tidStr.includes("cheil_front_name")) ? "/cheil/cheil_front_name.jpg" : "/cheil/cheil_build_front_name.jpg";
      const src = companyNameAssetBase64 || (!isBack ? defaultCheilFront : "/cheil/cheil_back_name.jpg");
      companyHtml = `<image href="${src}" xlink:href="${src}" x="${config.fields.companyName.x}" y="${key === "cheil" ? cheilY.companyName : (!isBack ? config.fields.companyName.y - 1 : config.fields.companyName.y)}" width="${!isBack ? 217.6 : 216.5}" height="${!isBack ? 13.8 : 8.8}" preserveAspectRatio="xMinYMin meet" />`;
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

      ${!isBack ? (
        isCheilOffice ? `
          ${front.department ? `<text x="220" y="60" font-size="12.5" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${front.department}</text>` : ""}
          ${(front.position1 || front.position2) ? `<text x="220" y="${front.department ? 77 : 60}" font-size="12.5" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${[front.position1, front.position2].filter(Boolean).join(" / ")}</text>` : ""}
        ` : `
          ${config.fields.departmentPosition && deptPosText ? `<text x="${config.fields.departmentPosition.x}" y="${config.fields.departmentPosition.y}" font-size="${config.fields.departmentPosition.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${deptPosText}</text>` : ""}
          ${front.position2 ? `<text x="${config.fields.position2?.x || 268}" y="${config.fields.position2?.y || 94}" font-size="${config.fields.position2?.fontSize || 12.2}" font-weight="${config.fields.position2?.fontWeight || "700"}" fill="${config.fields.position2?.fill || "#1e293b"}" dominant-baseline="hanging">${front.position2}</text>` : ""}
        `
      ) : ""}

      ${isBack ? (
        key === "cheil" ? `
          ${(back.department || back.position1) ? `<text x="220" y="62" font-size="12.5" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${[back.department, back.position1?.replace(/\/$/, "").trim()].filter(Boolean).join(" / ")}</text>` : ""}
          ${back.position2 ? `<text x="220" y="79" font-size="12.5" font-weight="400" fill="#475569" dominant-baseline="hanging">${back.position2}</text>` : ""}
        ` : `
          ${config.fields.position1 && back.position1 ? `<text x="${config.fields.position1.x}" y="${config.fields.position1.y}" font-size="${config.fields.position1.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${(back.department && back.department.trim() !== "") ? (back.position1.endsWith("/") ? back.position1 : back.position1 + " /") : back.position1.replace(/\/$/, "").trim()}</text>` : ""}
          ${config.fields.department && back.department ? `<text x="${config.fields.department.x}" y="${config.fields.department.y}" font-size="${config.fields.department.fontSize}" font-weight="500" fill="#1e293b" dominant-baseline="hanging">${back.department}</text>` : ""}
          ${key === "hanmi" && back.position2 ? `<text x="268" y="108" font-size="12.2" font-weight="700" fill="#1e293b" dominant-baseline="hanging">${back.position2}</text>` : ""}
        `
      ) : ""}

      ${companyHtml}

      ${key === "cheil" && config.fields.telAndFax && (currentData.telephone || currentData.fax) ? `<text x="${config.fields.telAndFax.x}" y="${cheilY.telAndFax}" font-size="${config.fields.telAndFax.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `${currentData.telephone ? `${isCheilOffice ? "전화 :" : "대표 :"} ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}` : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`}</text>` : ""}

      ${key === "hanmi" && config.fields.telephone && currentData.telephone ? `<text x="${config.fields.telephone.x}" y="${cardY.telephone}" font-size="${config.fields.telephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.telephone.x}" font-weight="400" fill="#1e293b">T</tspan><tspan x="${config.fields.telephone.x + 16}">${telephoneText}</tspan></text>` : ""}

      ${config.fields.directTelephone && currentData.directTelephone ? `<text x="${config.fields.directTelephone.x}" y="${key === "cheil" ? cheilY.directTel : config.fields.directTelephone.y}" font-size="${config.fields.directTelephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `직통 : ${currentData.directTelephone}` : `Dir: ${currentData.directTelephone}`) : `Dir ${currentData.directTelephone}`}</text>` : ""}

      ${config.fields.mobile && currentData.mobile ? `<text x="${config.fields.mobile.x}" y="${key === "cheil" ? cheilY.mobile : (key === "hanmi" ? cardY.mobile : config.fields.mobile.y)}" font-size="${config.fields.mobile.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `핸드폰 : ${currentData.mobile}` : `Mobile: ${currentData.mobile}`) : `<tspan x="${config.fields.mobile.x}" font-weight="400" fill="#1e293b">M</tspan><tspan x="${config.fields.mobile.x + 16}">${mobileText}</tspan>`}</text>` : ""}

      ${config.fields.email && currentData.email ? `<text x="${config.fields.email.x}" y="${key === "cheil" ? cheilY.email : (key === "hanmi" ? cardY.email : config.fields.email.y)}" font-size="${config.fields.email.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? `E-mail: ${currentData.email}` : `<tspan x="${config.fields.email.x}" font-weight="400" fill="#1e293b">E</tspan><tspan x="${config.fields.email.x + 16}">${currentData.email}</tspan>`}</text>` : ""}

      ${config.fields.website && currentData.website ? `<text x="${config.fields.website.x}" y="${key === "cheil" ? cheilY.website : (key === "hanmi" ? cardY.website : config.fields.website.y)}" font-size="${config.fields.website.fontSize}" font-weight="700" fill="${key === "cheil" ? "#0f172a" : "#004B96"}" dominant-baseline="hanging">${currentData.website}</text>` : ""}

      ${key === "hanmi" && !isBack ? (() => {
        const [addr1, addr2] = getHanmiFrontAddressLines(front);
        return `
          ${addr1 ? `<text x="${config.fields.address1?.x}" y="${cardY.address1}" font-size="${config.fields.address1?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr1}</text>` : ""}
          ${addr2 ? `<text x="${config.fields.address2?.x}" y="${cardY.address2}" font-size="${config.fields.address2?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr2}</text>` : ""}
        `;
      })() : ""}

      ${isCheilOffice && !isBack ? `
        ${front.address ? `<text x="${config.fields.address?.x || 220}" y="${cheilY.address}" font-size="${config.fields.address?.fontSize || 10}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address.startsWith("본사") ? (front.address.startsWith("본사 :") ? front.address : front.address.replace(/^본사\s*:?\s*/, "본사 : ")) : `본사 : ${front.address}`}</text>` : ""}
        ${front.fieldAddress ? `<text x="${config.fields.address?.x || 220}" y="${cheilY.fieldAddress}" font-size="${config.fields.address?.fontSize || 10}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.fieldAddress.startsWith("현장") ? (front.fieldAddress.startsWith("현장 :") ? front.fieldAddress : front.fieldAddress.replace(/^현장\s*:?\s*/, "현장 : ")) : `현장 : ${front.fieldAddress}`}</text>` : ""}
      ` : (key === "cheil" && !isBack && front.address ? `
        <text x="${config.fields.address?.x}" y="${cheilY.address}" font-size="${config.fields.address?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${front.address}</text>
      ` : "")}

      ${isBack && key === "cheil" ? (() => {
        const [cAddr1, cAddr2] = getCheilBackAddressLines(back);
        return `
          <text x="${config.fields.address1?.x}" y="${cheilY.address1}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${cAddr1}</text>
          <text x="${config.fields.address2?.x}" y="${cheilY.address2}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${cAddr2}</text>
        `;
      })() : ""}

      ${isBack && key === "hanmi" ? (() => {
        const [bAddr1, bAddr2, bAddr3] = getHanmiBackAddressLines(back);
        return `
          ${bAddr1 ? `<text x="${config.fields.address1?.x}" y="${cardY.address1}" font-size="${config.fields.address1?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr1}</text>` : ""}
          ${bAddr2 ? `<text x="${config.fields.address2?.x}" y="${cardY.address2}" font-size="${config.fields.address2?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr2}</text>` : ""}
          ${bAddr3 ? `<text x="${config.fields.address3?.x}" y="${cardY.address3}" font-size="${config.fields.address3?.fontSize}" fill="#334155" dominant-baseline="hanging">${bAddr3}</text>` : ""}
        `;
      })() : ""}
    </svg>
  `;
}
