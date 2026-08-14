import { jsPDF } from "jspdf";
import * as opentype from "opentype.js";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS } from "@/shared/constants/cardTemplates";
import { getHanmiFrontAddressLines, getHanmiBackAddressLines, getCheilBackAddressLines, getCheilOfficeAddressLines, getCondensedLetterSpacing, getCheilCardY } from "@/components/card/SvgBusinessCardPreview";

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

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (e) {
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function registerFontToDoc(doc: jsPDF, fontUrl: string, fontName: string, fontStyle = "normal") {
  try {
    // jsPDF는 폰트 명칭 및 파일명에 오직 ASCII (영문/숫자) 객체 이름만 허용하므로 한글 파싱 및 필터링 적용
    const asciiFontName = fontName.replace(/[^\x00-\x7F]/g, "").trim();
    if (!asciiFontName) return;

    const buffer = await fetchArrayBuffer(fontUrl);
    if (!buffer) return;
    const base64 = arrayBufferToBase64(buffer);

    // OTF와 TTF 확장자를 정확히 구분하여 등록 (Acrobat Invalid /BBox 에러 방지)
    const isOtf = fontUrl.toLowerCase().includes(".otf");
    const ext = isOtf ? "otf" : "ttf";
    const fileName = `${asciiFontName}.${ext}`;

    doc.addFileToVFS(fileName, base64);
    doc.addFont(fileName, asciiFontName, fontStyle);
  } catch (e) {
    console.warn(`Failed to register font ${fontName} to jsPDF VFS:`, e);
  }
}



function renderBackgroundGraphics(
  doc: jsPDF,
  key: string,
  config: any,
  isBack: boolean,
  logoBase64: string,
  companyNameAssetBase64: string = "",
  sloganAssetBase64: string = "",
  tidStr: string = "",
  cheilY?: any
) {
  const sx = 92 / 519;
  const sy = 52 / 288.333;

  // 1. 하단 색상 바 (Bottom Bar)
  if (config.showBottomBar) {
    if (key === "cheil") {
      doc.setFillColor(0, 56, 118); // #003876
      doc.rect(0, 48.2, 92, 3.8, "F");
      doc.setFillColor(85, 185, 54); // #55b936
      doc.rect(0, 48.2, 15.6, 3.8, "F");
    } else {
      doc.setFillColor(0, 75, 150); // #004B96
      doc.rect(0, 49.0, 92, 3.0, "F");
    }
  }

  // 2. 로고 이미지 (Logo - PDF 전용 사양 및 한미 로고 높이 축소 적용)
  if (logoBase64) {
    let logoSpec = config.logoSpec || {
      x: key === "cheil" ? 32 : (isBack ? 30 : 28),
      y: key === "cheil" ? 36 : (isBack ? 52 : 44),
      width: key === "cheil" ? 155 : (isBack ? 152 : 172),
      height: key === "cheil" ? 48 : (isBack ? 30 : 34),
    };
    if (key === "hanmi") {
      logoSpec = {
        x: logoSpec.x,
        y: isBack ? 71 : 67,
        width: logoSpec.width,
        height: isBack ? 32 : 36,
      };
    }
    const logoYOffset = key === "cheil" ? 1.0 : 0;
    try {
      doc.addImage(
        logoBase64,
        "PNG",
        logoSpec.x * sx,
        logoSpec.y * sy + logoYOffset,
        logoSpec.width * sx,
        logoSpec.height * sy
      );
    } catch (e) {
      console.warn("Logo addImage warn:", e);
    }
  }

  // 3. 슬로건 이미지 ("Smiling Technology" - 위아래 높이 살짝 축소 15.5pt)
  if (config.showSlogan && sloganAssetBase64) {
    let sloganSpec = config.sloganSpec || {
      x: 35,
      y: 239,
      width: 152,
      height: 17.5,
    };
    if (key === "cheil") {
      sloganSpec = {
        x: sloganSpec.x,
        y: 232,
        width: 143,
        height: 16.5,
      };
    }
    try {
      doc.addImage(
        sloganAssetBase64,
        "JPEG",
        sloganSpec.x * sx,
        sloganSpec.y * sy,
        sloganSpec.width * sx,
        sloganSpec.height * sy
      );
    } catch (e) {
      console.warn("Slogan addImage warn:", e);
    }
  }

  // 4. 상호 이미지 (Company Name Asset - 제일엔지니어링 앞면 -6, 뒷면 -2 오프셋 적용)
  if (config.fields.companyName && companyNameAssetBase64) {
    const isCheilOffice = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");
    let companyYBase = (key === "cheil" && cheilY?.companyName !== undefined ? cheilY.companyName : (!isBack ? 124 : 121));
    if (key === "cheil" && !isCheilOffice) {
      companyYBase -= (!isBack ? 6 : 2);
    }
    let companyX = config.fields.companyName.x * sx;
    let companyY = companyYBase * sy;
    let companyW = (!isBack ? 252 : 234) * sx;
    let companyH = (!isBack ? 16 : 9.5) * sy;

    const isTemplate4 = tidStr === "4" || tidStr.includes("cheil_front_name");
    if (key === "cheil" && isTemplate4 && !isBack) {
      companyW = 122 * sx;
    }

    if (key === "hanmi") {
      companyY = (!isBack ? 148 : 164) * sy;
      companyW = (!isBack ? 143.7 : 159.9) * sx;
      companyH = 14.2 * sy;
    }

    try {
      doc.addImage(
        companyNameAssetBase64,
        "JPEG",
        companyX,
        companyY,
        companyW,
        companyH
      );
    } catch (e) {
      console.warn("CompanyName addImage warn:", e);
    }
  }
}

export function computeCheilOfficePdfY(cardData: any) {
  const front = cardData?.front || {};
  let currentY = 255;
  const res: any = {
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
    fieldAddressLines: [] as { text: string; y: number }[],
    addressLines: [] as { text: string; y: number }[],
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
  const fieldAddrLines = getCheilOfficeAddressLines(front.fieldAddress, "현장", 38);
  if (fieldAddrLines.length > 0) {
    const lineObjects = [];
    for (let i = fieldAddrLines.length - 1; i >= 0; i--) {
      currentY -= step;
      lineObjects.unshift({ text: fieldAddrLines[i], y: currentY });
    }
    res.fieldAddressLines = lineObjects;
    res.fieldAddress = lineObjects[0]?.y || currentY;
  } else {
    currentY -= step;
    res.fieldAddressLines = [{ text: "", y: currentY }];
    res.fieldAddress = currentY;
  }
  if (front.address) {
    const lines = getCheilOfficeAddressLines(front.address, "본사", 38);
    const lineObjects = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      currentY -= step;
      lineObjects.unshift({ text: lines[i], y: currentY });
    }
    res.addressLines = lineObjects;
    res.address = lineObjects[0]?.y || currentY;
  }
  currentY -= 25;
  res.companyName = currentY;
  return res;
}

function renderPureNativeTextStream(
  doc: jsPDF,
  key: string,
  config: any,
  cardData: any,
  isBack: boolean,
  tidStr: string,
  cheilYParam?: any
) {
  const front = cardData.front || {};
  const back = cardData.back || {};
  const currentData = isBack ? back : front;

  const sx = 92 / 519;
  const sy = 52 / 288.333;

  const isCheilOffice = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");

  // 미리보기(SvgBusinessCardPreview)와 1:1 완벽 동기화되는 cardY 동적 위치 포지션 계산기
  const cardY = cheilYParam || (() => {
    if (isCheilOffice) {
      return computeCheilOfficePdfY(cardData);
    }

    if (key === "hanmi") {
      if (!isBack) {
        // 한미글로벌 앞면 (국문): 상호(148) 고정, 하단 항목간 줄 간격 +2씩 확장 (T: 172, M: 193, E: 214, Addr1: 238, Addr2: 258)
        const [addr1, addr2] = getHanmiFrontAddressLines(front);
        const addr2Y = 258;
        const addr1Y = addr2 ? 238 : 258;

        let currentY = addr2 ? 238 : 258;
        const step = 21;

        let emailY = 214;
        if (config.fields.email && front.email) {
          currentY -= step;
          emailY = currentY;
        }

        let mobileY = 193;
        if (config.fields.mobile && front.mobile) {
          currentY -= step;
          mobileY = currentY;
        }

        let telephoneY = 172;
        if (config.fields.telephone && front.telephone) {
          currentY -= step;
          telephoneY = currentY;
        }

        let companyNameY = 148;

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
        // 한미글로벌 뒷면 (영문): 상호명(164), 홈페이지(188 - 독립 2pt 상향), 주소(209/227/245)
        const [b1, b2, b3] = getHanmiBackAddressLines(back);
        const validLines = [b1, b2, b3].filter(Boolean);
        const lineCount = validLines.length || 1;

        const b3Y = 245;
        const b2Y = lineCount >= 3 ? 227 : (lineCount === 2 ? 245 : 245);
        const b1Y = lineCount === 3 ? 209 : (lineCount === 2 ? 227 : 245);

        const websiteY = 188;
        const companyNameY = 164;

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

    // 제일엔지니어링 앞면/뒷면 주소 및 연락처 블록 Y좌표 (데이터 없으면 하단 웹사이트 기준으로 동적 밀착 배치)
    if (key === "cheil") {
      return getCheilCardY(cardData, config, isBack, false);
    }

    return {
      website: 246,
      email: 227,
      mobile: 208,
      directTel: 189,
      telAndFax: 170,
      fieldAddress: 174,
      telephone: 149,
      address: 151,
      address1: 144,
      address2: 161,
      address3: 233,
      companyName: 132,
    };
  })();

  const cheilY = cardY;
  // Adobe Acrobat VA -0.50 (앞면, -0.17mm) 및 VA -0.25 (뒷면, -0.08mm) 음수 자간(Condensed) 적용
  const cheilBottomCharSpace = !isBack ? -0.17 : -0.08;

  // 1. 성명 (Name - 원복)
  const nameText = !isBack ? formatKoreanName(front.name) : back.name;
  if (config.fields.name && nameText) {
    const x = config.fields.name.x * sx;
    const fontSize = key === "cheil" ? 11 : (key === "hanmi" ? 13 : (config.fields.name.fontSize || 24.5) * 0.35);
    const fontCapHeight = key === "cheil" ? 11 * 0.76 : (config.fields.name.fontSize || 24.5) * 0.76;
    const nameYBase = key === "cheil" ? (config.fields.name.y + 10) : config.fields.name.y;
    let y = (nameYBase + fontCapHeight) * sy;
    if (key === "cheil") {
      y += 2.0;
    }
    doc.setFont("NanumSquareEB", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text(nameText, x, y);
  }

  // 2. 부서 / 직급 (제일엔지니어링 디자인 명세 6pt NanumSquareB 적용)
  if (!isBack) {
    if (isCheilOffice) {
      if (front.department) {
        const deptY = (60 + 6 * 0.76) * sy + 2.0;
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        if (front.department.length > 26) {
          doc.text(front.department, 220 * sx, deptY, { charSpace: -0.23 });
        } else {
          doc.text(front.department, 220 * sx, deptY);
        }
      }
      if (front.position1 || front.position2) {
        const pos1 = (front.position1 || "").trim();
        const pos2 = (front.position2 || "").trim();
        const combinedPos = [pos1, pos2].filter(Boolean).join(" / ");
        const basePosSvgY = front.department ? 77 : 60;

        if (pos1 && pos2 && combinedPos.length > 30) {
          // 직책 과 직급이 합쳐서 30 자 넘어가면 직급이 다음줄로
          const pos1PdfY = (basePosSvgY + 6 * 0.76) * sy + 2.0;
          doc.setFont("NanumSquareB", "normal");
          doc.setFontSize(6);
          doc.setTextColor(30, 41, 59);
          if (pos1.length > 28) {
            doc.text(pos1, 220 * sx, pos1PdfY, { charSpace: -0.23 });
          } else {
            doc.text(pos1, 220 * sx, pos1PdfY);
          }

          const pos2PdfY = (basePosSvgY + 17 + 6 * 0.76) * sy + 2.0;
          doc.setFont("NanumSquareB", "normal");
          doc.setFontSize(6);
          doc.setTextColor(71, 85, 105);
          doc.text(pos2, 220 * sx, pos2PdfY);
        } else if (combinedPos) {
          const posPdfY = (basePosSvgY + 6 * 0.76) * sy + 2.0;
          doc.setFont("NanumSquareB", "normal");
          doc.setFontSize(6);
          doc.setTextColor(30, 41, 59);
          if (pos1.length > 28) {
            doc.text(combinedPos, 220 * sx, posPdfY, { charSpace: -0.23 });
          } else {
            doc.text(combinedPos, 220 * sx, posPdfY);
          }
        }
      }
    } else {
      const deptPosText = key === "cheil"
        ? [front.department, front.position1].filter(Boolean).join(" / ")
        : [front.position1, front.department].filter(Boolean).join(" / ");

      if (config.fields.departmentPosition && deptPosText) {
        const x = config.fields.departmentPosition.x * sx;
        const fontSize = key === "cheil" ? 6 : (key === "hanmi" ? 6 : (config.fields.departmentPosition.fontSize || 12.5) * 0.35);
        const fontCapHeight = key === "cheil" ? 6 * 0.76 : (config.fields.departmentPosition.fontSize || 12.5) * 0.76;
        let y = (config.fields.departmentPosition.y + fontCapHeight) * sy;
        if (key === "cheil") {
          y += 2.0;
        }
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(30, 41, 59); // #1e293b
        doc.text(deptPosText, x, y);
      }

      if (front.position2) {
        const x = (config.fields.position2?.x || (key === "cheil" ? 220 : 268)) * sx;
        const fontSize = key === "cheil" ? 6 : (key === "hanmi" ? 6 : 12.5 * 0.35);
        const fontCapHeight = key === "cheil" ? 6 * 0.76 : 12.5 * 0.76;
        let y = ((config.fields.position2?.y || (key === "cheil" ? 79 : 94)) + fontCapHeight) * sy;
        if (key === "cheil") {
          y += 2.0;
        }
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(key === "cheil" ? 71 : 30, key === "cheil" ? 85 : 41, key === "cheil" ? 105 : 59);
        doc.text(front.position2, x, y);
      }
    }
  }

  // 3. 뒷면 영문 부서 / 직급 (제일엔지니어링 디자인 명세 6pt NanumSquareB 적용 - 45자 이상 시 자간 10 축소)
  if (isBack) {
    if (key === "cheil") {
      const cBackText = [back.department, back.position1?.replace(/\/$/, "").trim()].filter(Boolean).join(" / ");
      if (cBackText) {
        const options = cBackText.length >= 45 ? { charSpace: -0.12 } : undefined;
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        const y = (62 + 6 * 0.76) * sy + 2.0;
        if (options) {
          doc.text(cBackText, 220 * sx, y, options);
        } else {
          doc.text(cBackText, 220 * sx, y);
        }
      }
      if (back.position2) {
        const options2 = back.position2.length >= 45 ? { charSpace: -0.12 } : undefined;
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        const y = (79 + 6 * 0.76) * sy + 2.0;
        if (options2) {
          doc.text(back.position2, 220 * sx, y, options2);
        } else {
          doc.text(back.position2, 220 * sx, y);
        }
      }
    } else {
      if (back.position1) {
        const hBackPos1 = (back.department && back.department.trim() !== "")
          ? (back.position1.endsWith("/") ? back.position1 : `${back.position1} /`)
          : back.position1.replace(/\/$/, "").trim();
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        doc.text(hBackPos1, config.fields.position1.x * sx, (config.fields.position1.y + 12.5 * 0.76) * sy);
      }
      if (back.department) {
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        doc.text(back.department, config.fields.department.x * sx, ((config.fields.department.y || 88) + 12.5 * 0.76) * sy);
      }
      if (back.position2) {
        doc.setFont("NanumSquareB", "normal");
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        doc.text(back.position2, 268 * sx, (110 + 12.5 * 0.76) * sy);
      }
    }
  }

  // 4. 연락처 (T, M, E - 제일엔지니어링 자간 앞면 0.5VA, 뒷면 0.25VA 적용)
  if (key === "cheil" && config.fields.telAndFax && (currentData.telephone || currentData.fax)) {
    const text = !isBack
      ? `${currentData.telephone ? `${isCheilOffice ? "전화 :" : "대표 :"} ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}`
      : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`;
    doc.setFont("AppleSDGothicNeoL00", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(text, config.fields.telAndFax.x * sx, (cheilY.telAndFax + 7 * 0.76) * sy, { charSpace: cheilBottomCharSpace });
  }

  if (key === "hanmi" && !isBack && currentData.telephone) {
    const telVal = currentData.telephone.startsWith("+82")
      ? currentData.telephone
      : `+82 (0)${currentData.telephone.replace(/^0/, "")}`;
    const xBase = config.fields.telephone?.x || 268;
    const yVal = (cardY.telephone + 7 * 0.76) * sy;
    doc.setFont("NanumSquareB", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text("T", xBase * sx, yVal);
    doc.text(telVal, (xBase + 20) * sx, yVal);
  }

  if (config.fields.directTelephone && currentData.directTelephone) {
    const text = key === "cheil"
      ? (!isBack ? `직통 : ${currentData.directTelephone}` : `Dir: ${currentData.directTelephone}`)
      : `Dir ${currentData.directTelephone}`;
    doc.setFont(key === "cheil" ? "AppleSDGothicNeoL00" : "NanumSquareB", "normal");
    doc.setFontSize(key === "cheil" ? 7 : (key === "hanmi" ? 7 : 12.5 * 0.35));
    doc.setTextColor(30, 41, 59);
    if (key === "cheil") {
      doc.text(text, config.fields.directTelephone.x * sx, (cheilY.directTel + 7 * 0.76) * sy, { charSpace: cheilBottomCharSpace });
    } else {
      doc.text(text, config.fields.directTelephone.x * sx, (config.fields.directTelephone.y + 7 * 0.76) * sy);
    }
  }

  if (config.fields.mobile && currentData.mobile) {
    const mobileVal = currentData.mobile.startsWith("+82")
      ? currentData.mobile
      : `+82 (0)${currentData.mobile.replace(/^0/, "")}`;
    const xBase = key === "hanmi" ? (config.fields.mobile?.x || 268) : config.fields.mobile.x;
    const yVal = ((key === "cheil" ? cheilY.mobile : cardY.mobile) + 7 * 0.76) * sy;
    doc.setFont(key === "cheil" ? "AppleSDGothicNeoL00" : "NanumSquareB", "normal");
    doc.setFontSize(key === "cheil" ? 7 : (key === "hanmi" ? 7 : 12.5 * 0.35));
    doc.setTextColor(30, 41, 59);
    if (key === "hanmi") {
      doc.text("M", xBase * sx, yVal);
      doc.text(mobileVal, (xBase + 20) * sx, yVal);
    } else {
      doc.text(!isBack ? `핸드폰 : ${currentData.mobile}` : `Mobile: ${currentData.mobile}`, xBase * sx, yVal, { charSpace: cheilBottomCharSpace });
    }
  }

  if (config.fields.email && currentData.email) {
    const xBase = config.fields.email?.x || 268;
    const yVal = ((key === "cheil" ? cheilY.email : cardY.email) + 7 * 0.76) * sy;
    doc.setFont(key === "cheil" ? "AppleSDGothicNeoL00" : "NanumSquareB", "normal");
    doc.setFontSize(key === "cheil" ? 7 : (key === "hanmi" ? 7 : 12.5 * 0.35));
    doc.setTextColor(30, 41, 59);
    if (key === "hanmi") {
      doc.text("E", xBase * sx, yVal);
      doc.text(currentData.email, (xBase + 20) * sx, yVal);
    } else {
      doc.text(`E-mail: ${currentData.email}`, xBase * sx, yVal, { charSpace: cheilBottomCharSpace });
    }
  }

  if (config.fields.website && currentData.website) {
    doc.setFont(key === "cheil" ? "AppleSDGothicNeoB00" : "NanumSquareB", "normal");
    doc.setFontSize(key === "cheil" ? 7 : (key === "hanmi" ? 7 : 13.5 * 0.35));
    doc.setTextColor(key === "cheil" ? 15 : 0, key === "cheil" ? 23 : 75, key === "cheil" ? 42 : 150);
    if (key === "cheil") {
      doc.text(currentData.website, config.fields.website.x * sx, (cheilY.website + 7 * 0.76) * sy, { charSpace: cheilBottomCharSpace });
    } else {
      doc.text(currentData.website, config.fields.website.x * sx, (cardY.website + 7 * 0.76) * sy);
    }
  }

  // 5. 주소 (Address - 제일엔지니어링 자간 앞면 0.5VA, 뒷면 0.25VA 적용)
  doc.setFont(key === "cheil" ? "AppleSDGothicNeoL00" : "NanumSquareB", "normal");
  doc.setFontSize(key === "cheil" ? 7 : 7);
  doc.setTextColor(51, 65, 85); // #334155

  if (!isBack) {
    if (isCheilOffice) {
      const labelX = (config.fields.address?.x || 220) * sx;
      const bodyX = labelX + (31 * sx);

      // 본사 주소
      if (cheilY.addressLines && cheilY.addressLines.length > 0) {
        cheilY.addressLines.forEach((lineObj: { text: string; y: number }, idx: number) => {
          const linePdfY = (lineObj.y + 7 * 0.76) * sy;
          const charSpace = lineObj.text.length >= 36 ? -0.28 : cheilBottomCharSpace;
          if (idx === 0) {
            doc.text("본사 : ", labelX, linePdfY, { charSpace: cheilBottomCharSpace });
            if (lineObj.text) {
              doc.text(lineObj.text, bodyX, linePdfY, { charSpace });
            }
          } else {
            doc.text(lineObj.text, bodyX, linePdfY, { charSpace });
          }
        });
      }

      // 현장 주소
      if (cheilY.fieldAddressLines && cheilY.fieldAddressLines.length > 0) {
        cheilY.fieldAddressLines.forEach((lineObj: { text: string; y: number }, idx: number) => {
          const linePdfY = (lineObj.y + 7 * 0.76) * sy;
          const charSpace = lineObj.text.length >= 36 ? -0.28 : cheilBottomCharSpace;
          if (idx === 0) {
            doc.text("현장 : ", labelX, linePdfY, { charSpace: cheilBottomCharSpace });
            if (lineObj.text) {
              doc.text(lineObj.text, bodyX, linePdfY, { charSpace });
            }
          } else {
            doc.text(lineObj.text, bodyX, linePdfY, { charSpace });
          }
        });
      }
    } else if (key === "cheil" && front.address) {
      const addrCharSpace = front.address.length >= 36 ? -0.28 : cheilBottomCharSpace;
      doc.text(front.address, (config.fields.address?.x || 220) * sx, (cheilY.address + 7 * 0.76) * sy, { charSpace: addrCharSpace });
    } else if (key === "hanmi") {
      const [addr1, addr2] = getHanmiFrontAddressLines(front);
      if (addr1) doc.text(addr1, (config.fields.address1?.x || 268) * sx, (cardY.address1 + 7 * 0.76) * sy);
      if (addr2) doc.text(addr2, (config.fields.address2?.x || 268) * sx, (cardY.address2 + 7 * 0.76) * sy);
    }
  } else {
    if (key === "cheil") {
      const [c1, c2] = getCheilBackAddressLines(back);
      const c1CharSpace = (c1 && c1.length >= 36) ? -0.15 : cheilBottomCharSpace;
      const c2CharSpace = (c2 && c2.length >= 36) ? -0.15 : cheilBottomCharSpace;
      if (c1) doc.text(c1, (config.fields.address1?.x || 220) * sx, (cheilY.address1 + 7 * 0.76) * sy, { charSpace: c1CharSpace });
      if (c2) doc.text(c2, (config.fields.address2?.x || 220) * sx, (cheilY.address2 + 7 * 0.76) * sy, { charSpace: c2CharSpace });
    } else if (key === "hanmi") {
      const [a1, a2, a3] = getHanmiBackAddressLines(back);
      if (a1) doc.text(a1, (config.fields.address1?.x || 268) * sx, (cardY.address1 + 7 * 0.76) * sy);
      if (a2) doc.text(a2, (config.fields.address2?.x || 268) * sx, (cardY.address2 + 7 * 0.76) * sy);
      if (a3) doc.text(a3, (config.fields.address3?.x || 268) * sx, (cardY.address3 + 7 * 0.76) * sy);
    }
  }
}

/**
 * Adobe Illustrator 100% 텍스트 직접 수정 지원 / 로고·상호 제외 살아있는 텍스트 Native PDF 생성 및 다운로드
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

  // public/fonts 디렉토리 내 실존 폰트 파일 100% 매핑 로드
  const fontUlsungdo = await loadFontFile("/fonts/HYWULM.TTF") || await loadFontFile(encodeURI("/fonts/HY울릉도E.ttf"));
  const fontPadosori = await loadFontFile(encodeURI("/fonts/a파도소리_3.otf"));
  const fontNanumSquare = await loadFontFile("/fonts/NanumSquareEB.ttf") || await loadFontFile("/fonts/NanumSquareB_1.ttf") || await loadFontFile("/fonts/NanumSquare.ttf");

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

    // jsPDF VFS ASCII 폰트 등록 (Acrobat BBox 에러를 유발하는 OTF 포맷 제외하고 검증된 TrueType 폰트 100% 매핑)
    await registerFontToDoc(doc, "/fonts/HYWULM.TTF", "HYUlsungdoM");
    await registerFontToDoc(doc, "/fonts/HYWULB.TTF", "HYUlsungdoB");
    await registerFontToDoc(doc, encodeURI("/fonts/HY울릉도E.ttf"), "HYUlsungdoE");
    await registerFontToDoc(doc, encodeURI("/fonts/HY울릉도L.ttf"), "HYUlsungdoL");
    await registerFontToDoc(doc, "/fonts/NanumSquareEB.ttf", "NanumSquareEB");
    await registerFontToDoc(doc, "/fonts/NanumSquareB_1.ttf", "NanumSquareB");
    await registerFontToDoc(doc, "/fonts/NanumSquareR.ttf", "NanumSquareR");
    await registerFontToDoc(doc, "/fonts/NanumSquareR.ttf", "AppleSDGothicNeoL00");
    await registerFontToDoc(doc, "/fonts/NanumSquareR.ttf", "AppleSDGothicNeo");
    await registerFontToDoc(doc, "/fonts/NanumSquareB_1.ttf", "AppleSDGothicNeoB00");
    await registerFontToDoc(doc, "/fonts/NanumSquareB_1.ttf", "AppleSDGothicNeoB");
    await registerFontToDoc(doc, "/fonts/NanumSquare.ttf", "NanumSquare");

    // --- Page 1: 앞면 (배경 이미지/그래픽 + Pure Native Text Stream) ---
    const frontLogoBase64 = await fetchLogoBase64(specGroup.front.logoUrl);
    const cheilFrontAssetUrl = (tidStr === "4" || tidStr.includes("cheil_front_name"))
      ? "/cheil/cheil_front_name.jpg"
      : "/cheil/cheil_build_front_name.jpg";
    const companyNameFrontAssetBase64 = key === "hanmi"
      ? await fetchLogoBase64("/hanmi/hanmi_front_name.jpg")
      : await fetchLogoBase64(cheilFrontAssetUrl);
    const cheilSmileBase64 = key === "cheil" ? await fetchLogoBase64("/cheil/cheil_smile.jpg") : "";

    // 앞면 배경 그래픽 100% 신뢰성 직출력 (하단 바, 로고 이미지, 슬로건 이미지, 상호 이미지)
    const isCheilOffice = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");
    const frontCheilY = isCheilOffice
      ? computeCheilOfficePdfY(cardData)
      : getCheilCardY(cardData, specGroup.front, false, false);

    renderBackgroundGraphics(
      doc,
      key,
      specGroup.front,
      false,
      frontLogoBase64,
      companyNameFrontAssetBase64,
      cheilSmileBase64,
      tidStr,
      frontCheilY
    );

    // 앞면 100% 살아있는 Pure Native Vector Text Stream 직접 출력
    renderPureNativeTextStream(doc, key, specGroup.front, cardData, false, tidStr, frontCheilY);

    const isSingleSided = tidStr === "5" || tidStr.includes("cheil_build_office") || tidStr.includes("본사 현장사무실");

    if (!isSingleSided) {
      // --- Page 2: 뒷면 ---
      doc.addPage([92, 52], "landscape");
      const backLogoBase64 = await fetchLogoBase64(specGroup.back.logoUrl);
      const companyNameBackAssetBase64 = key === "hanmi"
        ? await fetchLogoBase64("/hanmi/hanmi_back_name.jpg")
        : await fetchLogoBase64("/cheil/cheil_back_name.jpg");

      // 뒷면 배경 그래픽 100% 신뢰성 직출력 (하단 바, 로고 이미지, 슬로건 이미지, 상호 이미지)
      const backCheilY = getCheilCardY(cardData, specGroup.back, true, false);
      renderBackgroundGraphics(
        doc,
        key,
        specGroup.back,
        true,
        backLogoBase64,
        companyNameBackAssetBase64,
        cheilSmileBase64,
        tidStr,
        backCheilY
      );

      // 뒷면 100% 살아있는 Pure Native Vector Text Stream 직접 출력
      renderPureNativeTextStream(doc, key, specGroup.back, cardData, true, tidStr);
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
      const res: any = {
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
        fieldAddressLines: [] as { text: string; y: number }[],
        addressLines: [] as { text: string; y: number }[],
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
      const fieldAddrLines = getCheilOfficeAddressLines(front.fieldAddress, "현장", 38);
      if (fieldAddrLines.length > 0) {
        const lineObjects = [];
        for (let i = fieldAddrLines.length - 1; i >= 0; i--) {
          currentY -= step;
          lineObjects.unshift({ text: fieldAddrLines[i], y: currentY });
        }
        res.fieldAddressLines = lineObjects;
        res.fieldAddress = lineObjects[0]?.y || currentY;
      }
      if (front.address) {
        const lines = getCheilOfficeAddressLines(front.address, "본사", 38);
        const lineObjects = [];
        for (let i = lines.length - 1; i >= 0; i--) {
          currentY -= step;
          lineObjects.unshift({ text: lines[i], y: currentY });
        }
        res.addressLines = lineObjects;
        res.address = lineObjects[0]?.y || currentY;
      }
      currentY -= 20;
      res.companyName = currentY;
      return res;
    }

    if (key === "cheil") {
      return getCheilCardY(cardData, config, isBack, true);
    }

    if (key === "hanmi") {
      if (!isBack) {
        // 한미글로벌 앞면 (국문): 상호명(144) 하단 이격 조절 (T: 178, M: 197, E: 216, Addr1: 235, Addr2: 254)
        const [addr1, addr2] = getHanmiFrontAddressLines(front);
        const addr2Y = 254;
        const addr1Y = addr2 ? 235 : 254;

        let currentY = addr2 ? 235 : 254;
        const step = 19;

        let emailY = 216;
        if (config.fields.email && front.email) {
          currentY -= step;
          emailY = currentY;
        }

        let mobileY = 197;
        if (config.fields.mobile && front.mobile) {
          currentY -= step;
          mobileY = currentY;
        }

        let telephoneY = 178;
        if (config.fields.telephone && front.telephone) {
          currentY -= step;
          telephoneY = currentY;
        }

        let companyNameY = 144;

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
        // 한미글로벌 뒷면 (영문): 상호명(160) 하단 이격 조절 (Website: 190, Addr1: 208, Addr2: 226, Addr3: 244)
        const [b1, b2, b3] = getHanmiBackAddressLines(back);
        const validLines = [b1, b2, b3].filter(Boolean);
        const lineCount = validLines.length || 1;

        const b3Y = 244;
        const b2Y = lineCount >= 3 ? 226 : (lineCount === 2 ? 244 : 244);
        const b1Y = lineCount === 3 ? 208 : (lineCount === 2 ? 226 : 244);

        let currentY = b1Y;

        let websiteY = 190;
        if (config.fields.website && back.website) {
          currentY -= 18;
          websiteY = currentY;
        }

        let companyNameY = 160;

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
      companyHtml = `<image href="${src}" xlink:href="${src}" x="${config.fields.companyName.x}" y="${!isBack ? 148 : 164}" width="${!isBack ? 143.7 : 159.9}" height="14.2" preserveAspectRatio="xMinYMin meet" />`;
    } else {
      const defaultCheilFront = (tidStr === "4" || tidStr.includes("cheil_front_name")) ? "/cheil/cheil_front_name.jpg" : "/cheil/cheil_build_front_name.jpg";
      const src = companyNameAssetBase64 || (!isBack ? defaultCheilFront : "/cheil/cheil_back_name.jpg");
      const companyYVal = cheilY.companyName - (!isBack ? 6 : 2);
      companyHtml = `<image href="${src}" xlink:href="${src}" x="${config.fields.companyName.x}" y="${companyYVal}" width="${!isBack ? 252 : 258}" height="${!isBack ? 16 : 10.5}" preserveAspectRatio="xMinYMin meet" />`;
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
    <svg viewBox="-5.767 -5.767 530.533 299.866" width="530.533" height="299.866" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background:#ffffff; font-family:${key === "hanmi" ? "'NanumSquare', sans-serif" : "'HYUlsungdoM', 'NanumSquare', sans-serif"}; display:block;">
      <defs>
        <style>
          text { forced-color-adjust: none; color-scheme: light; }
        </style>
      </defs>
      ${bottomBarHtml}
      ${logoBase64 ? `<image href="${logoBase64}" xlink:href="${logoBase64}" x="${logoSpec.x}" y="${logoSpec.y}" width="${logoSpec.width}" height="${logoSpec.height}" preserveAspectRatio="xMinYMin meet" />` : ""}
      ${sloganHtml}

      ${config.fields.name && nameText ? `<text x="${config.fields.name.x}" y="${config.fields.name.y}" font-size="${config.fields.name.fontSize}" font-weight="${config.fields.name.fontWeight || "700"}" fill="${config.fields.name.fill || "#0f172a"}" font-family="${!isBack && key === "cheil" ? "HYUlsungdoM" : "NanumSquare"}" letter-spacing="${key === "cheil" ? (!isBack ? "0.5em" : "0.25em") : (!isBack ? "0.25em" : "normal")}" dominant-baseline="hanging">${nameText}</text>` : ""}

      ${!isBack ? (() => {
      if (isCheilOffice) {
        const deptText = front.department || "";
        const posText = [front.position1, front.position2].filter(Boolean).join(" / ");
        return `
            ${deptText ? `<text x="220" y="60" font-size="12.5" font-weight="500" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(deptText, 29) || "normal"}" dominant-baseline="hanging">${deptText}</text>` : ""}
            ${posText ? `<text x="220" y="${deptText ? 77 : 60}" font-size="12.5" font-weight="500" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(posText, 29) || "normal"}" dominant-baseline="hanging">${posText}</text>` : ""}
          `;
      }
      const threshold = key === "cheil" ? 29 : 26;
      const deptPosFontSz = config.fields.departmentPosition?.fontSize || (key === "cheil" ? 12.5 : 12.2);
      const pos2Text = front.position2 || "";
      const pos2FontSz = config.fields.position2?.fontSize || (key === "cheil" ? 12.5 : 12.2);
      return `
          ${config.fields.departmentPosition && deptPosText ? `<text x="${config.fields.departmentPosition.x}" y="${config.fields.departmentPosition.y}" font-size="${deptPosFontSz}" font-weight="${config.fields.departmentPosition.fontWeight || "500"}" fill="${config.fields.departmentPosition.fill || "#1e293b"}" letter-spacing="${getCondensedLetterSpacing(deptPosText, threshold) || "normal"}" dominant-baseline="hanging">${deptPosText}</text>` : ""}
          ${pos2Text ? `<text x="${config.fields.position2?.x || (key === "cheil" ? 220 : 268)}" y="${config.fields.position2?.y || (key === "cheil" ? 79 : 94)}" font-size="${pos2FontSz}" font-weight="${config.fields.position2?.fontWeight || (key === "cheil" ? "400" : "700")}" fill="${config.fields.position2?.fill || (key === "cheil" ? "#475569" : "#1e293b")}" letter-spacing="${getCondensedLetterSpacing(pos2Text, threshold) || "normal"}" dominant-baseline="hanging">${pos2Text}</text>` : ""}
        `;
    })() : ""}

      ${isBack ? (() => {
      if (key === "cheil") {
        const cBackText = [back.department, back.position1?.replace(/\/$/, "").trim()].filter(Boolean).join(" / ");
        const pos2Text = back.position2 || "";
        return `
            ${cBackText ? `<text x="220" y="62" font-size="12.5" font-weight="500" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(cBackText, 30) || "normal"}" dominant-baseline="hanging">${cBackText}</text>` : ""}
            ${pos2Text ? `<text x="220" y="79" font-size="12.5" font-weight="400" fill="#475569" letter-spacing="${getCondensedLetterSpacing(pos2Text, 30) || "normal"}" dominant-baseline="hanging">${pos2Text}</text>` : ""}
          `;
      }
      const hBackPos1 = (config.fields.position1 && back.position1)
        ? ((back.department && back.department.trim() !== "") ? (back.position1.endsWith("/") ? back.position1 : back.position1 + " /") : back.position1.replace(/\/$/, "").trim())
        : "";
      const hBackDept = back.department || "";
      const hBackPos2 = back.position2 || "";
      return `
          ${hBackPos1 ? `<text x="${config.fields.position1.x}" y="${config.fields.position1.y}" font-size="${config.fields.position1.fontSize}" font-weight="400" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(hBackPos1, 28) || "normal"}" dominant-baseline="hanging">${hBackPos1}</text>` : ""}
          ${hBackDept ? `<text x="${config.fields.department.x}" y="${config.fields.department.y}" font-size="${config.fields.department.fontSize}" font-weight="500" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(hBackDept, 28) || "normal"}" dominant-baseline="hanging">${hBackDept}</text>` : ""}
          ${hBackPos2 ? `<text x="268" y="110" font-size="12.2" font-weight="700" fill="#1e293b" letter-spacing="${getCondensedLetterSpacing(hBackPos2, 28) || "normal"}" dominant-baseline="hanging">${hBackPos2}</text>` : ""}
        `;
    })() : ""}

      ${companyHtml}

      ${key === "cheil" && config.fields.telAndFax && (currentData.telephone || currentData.fax) ? `<text x="${config.fields.telAndFax.x}" y="${cheilY.telAndFax}" font-size="${config.fields.telAndFax.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `${currentData.telephone ? `${isCheilOffice ? "전화 :" : "대표 :"} ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}` : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`}</text>` : ""}

      ${key === "hanmi" && config.fields.telephone && currentData.telephone ? `<text x="${config.fields.telephone.x}" y="${cardY.telephone}" font-size="${config.fields.telephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.telephone.x}" font-weight="400" fill="#1e293b">T</tspan><tspan x="${config.fields.telephone.x + 20}">${telephoneText}</tspan></text>` : ""}

      ${config.fields.directTelephone && currentData.directTelephone ? `<text x="${config.fields.directTelephone.x}" y="${key === "cheil" ? cheilY.directTel : config.fields.directTelephone.y}" font-size="${config.fields.directTelephone.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${key === "cheil" ? (!isBack ? `직통 : ${currentData.directTelephone}` : `Dir: ${currentData.directTelephone}`) : `Dir ${currentData.directTelephone}`}</text>` : ""}

      ${config.fields.mobile && currentData.mobile ? (key === "hanmi" ? `<text y="${cardY.mobile}" font-size="12.2" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.mobile.x || 268}" font-weight="400" fill="#1e293b">M</tspan><tspan x="${(config.fields.mobile.x || 268) + 20}">${mobileText}</tspan></text>` : `<text x="${config.fields.mobile.x}" y="${key === "cheil" ? cheilY.mobile : config.fields.mobile.y}" font-size="${config.fields.mobile.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">${!isBack ? `핸드폰 : ${currentData.mobile}` : `Mobile: ${currentData.mobile}`}</text>`) : ""}

      ${config.fields.email && currentData.email ? (key === "hanmi" ? `<text y="${cardY.email}" font-size="12.2" font-weight="400" fill="#1e293b" dominant-baseline="hanging"><tspan x="${config.fields.email.x || 268}" font-weight="400" fill="#1e293b">E</tspan><tspan x="${(config.fields.email.x || 268) + 20}">${currentData.email}</tspan></text>` : `<text x="${config.fields.email.x}" y="${key === "cheil" ? cheilY.email : config.fields.email.y}" font-size="${config.fields.email.fontSize}" font-weight="400" fill="#1e293b" dominant-baseline="hanging">E-mail: ${currentData.email}</text>`) : ""}

      ${config.fields.website && currentData.website ? `<text x="${config.fields.website.x}" y="${key === "cheil" ? cheilY.website : (key === "hanmi" ? cardY.website : config.fields.website.y)}" font-size="${config.fields.website.fontSize}" font-weight="700" fill="${key === "cheil" ? "#0f172a" : "#004B96"}" dominant-baseline="hanging">${currentData.website}</text>` : ""}

      ${key === "hanmi" && !isBack ? (() => {
      const [addr1, addr2] = getHanmiFrontAddressLines(front);
      return `
          ${addr1 ? `<text x="${config.fields.address1?.x}" y="${cardY.address1}" font-size="${config.fields.address1?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr1}</text>` : ""}
          ${addr2 ? `<text x="${config.fields.address2?.x}" y="${cardY.address2}" font-size="${config.fields.address2?.fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${addr2}</text>` : ""}
        `;
    })() : ""}

      ${isCheilOffice && !isBack ? (() => {
      const labelX = config.fields.address?.x || 220;
      const bodyX = labelX + 31;
      const fontSize = config.fields.address?.fontSize || 10;

      const addrLines = cheilY.addressLines && cheilY.addressLines.length > 0
        ? cheilY.addressLines.map((l: any) => l.text)
        : (front.address ? getCheilOfficeAddressLines(front.address, "본사", 34) : []);

      const fieldLines = cheilY.fieldAddressLines && cheilY.fieldAddressLines.length > 0
        ? cheilY.fieldAddressLines.map((l: any) => l.text)
        : (front.fieldAddress ? getCheilOfficeAddressLines(front.fieldAddress, "현장", 34) : [""]);

      const renderBlock = (lines: string[], prefix: string, startY: number) => {
        if (lines.length === 0) return "";
        return lines.map((text, idx) => {
          const lineY = startY + idx * 18;
          if (idx === 0) {
            return `<text y="${lineY}" font-size="${fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging"><tspan x="${labelX}">${prefix} : </tspan><tspan x="${bodyX}">${text}</tspan></text>`;
          }
          return `<text x="${bodyX}" y="${lineY}" font-size="${fontSize}" font-weight="400" fill="#334155" dominant-baseline="hanging">${text}</text>`;
        }).join("");
      };

      return renderBlock(addrLines, "본사", cheilY.address) + renderBlock(fieldLines, "현장", cheilY.fieldAddress);
    })() : (key === "cheil" && !isBack && front.address ? `
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
