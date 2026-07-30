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

// 한글 이름 자간 포맷팅
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

/**
 * 인쇄소 제출용 100% 무손실 벡터 2페이지 (90mm x 50mm) PDF 원클릭 즉시 생성 및 다운로드
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

  // 오프스크린 렌더링용 임시 컨테이너 생성
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "519px";
  container.style.height = "288.333px";
  document.body.appendChild(container);

  try {
    // 90mm x 50mm 정규격 2페이지 landscape PDF 세팅
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [90, 50],
      compress: true,
    });

    const docAny = doc as any;

    // 1페이지 (앞면/국문) SVG HTML String 생성
    const frontSpec = specGroup.front;
    const frontSvgHtml = createSvgMarkup(key, frontSpec, cardData, false);
    container.innerHTML = frontSvgHtml;
    const frontSvgElem = container.querySelector("svg");

    if (frontSvgElem && typeof docAny.svg === "function") {
      await docAny.svg(frontSvgElem, {
        x: 0,
        y: 0,
        width: 90,
        height: 50,
      });
    }

    // 2페이지 (뒷면/영문) 추가
    doc.addPage([90, 50], "landscape");
    const backSpec = specGroup.back;
    const backSvgHtml = createSvgMarkup(key, backSpec, cardData, true);
    container.innerHTML = backSvgHtml;
    const backSvgElem = container.querySelector("svg");

    if (backSvgElem && typeof docAny.svg === "function") {
      await docAny.svg(backSvgElem, {
        x: 0,
        y: 0,
        width: 90,
        height: 50,
      });
    }

    const orderNo = order.orderNo || order.id || "ORDER";
    const name = order.recipientName || order.name || "명함";
    const filename = `NCMS_명함인쇄_${orderNo}_${name}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    alert("인쇄용 PDF 생성 중 오류가 발생했습니다.");
  } finally {
    document.body.removeChild(container);
  }
}

// SVG HTML 마크업 동적 생성 함수
function createSvgMarkup(
  key: string,
  config: any,
  cardData: any,
  isBack: boolean
): string {
  const front = cardData.front || {};
  const back = cardData.back || {};
  const currentData = isBack ? back : front;

  const logoSpec = config.logoSpec || { x: 30, y: 55, width: 150, height: 50 };

  const bottomBarHtml = config.showBottomBar
    ? key === "cheil"
      ? `<rect x="0" y="278" width="519" height="15" fill="#003876" /><rect x="0" y="278" width="78" height="15" fill="#55b936" />`
      : `<rect x="0" y="283" width="519" height="10" fill="#004B96" />`
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
    <svg viewBox="${config.viewBox}" width="519" height="288.333" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Pretendard Variable', Pretendard, sans-serif;">
      ${bottomBarHtml}
      ${config.logoUrl ? `<image href="${config.logoUrl}" x="${logoSpec.x}" y="${logoSpec.y}" width="${logoSpec.width}" height="${logoSpec.height}" />` : ""}
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
