import React, { useState, useEffect } from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS, isCheilOfficeTemplate, isSingleSidedTemplate, wrapTextLines } from "@/shared/constants/cardTemplates";

interface SvgBusinessCardPreviewProps {
  templateId?: number | string;
  cardData: BusinessCardInputData;
  isBack?: boolean;
  scale?: number;
}

// 한글 이름 자간 포맷팅 (예: "홍길동" -> "홍    길    동")
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

// 한미글로벌 국문 주소 엔터(\n) 및 2줄 분할 처리
export function getHanmiFrontAddressLines(front: any): [string, string] {
  if (front?.address1 || front?.address2) {
    return [
      front?.address1 || "",
      front?.address2 || "",
    ];
  }
  const raw = (front?.address || "").trim();
  if (!raw) {
    return ["", ""];
  }
  if (raw.includes("\n")) {
    const lines = raw.split("\n").map((l: string) => l.trim()).filter(Boolean);
    return [lines[0] || "", lines.slice(1).join(" ")];
  }
  const splitMatch = raw.match(/^(.*?(?:87길|테헤란로|강남구|서울시|길|로))\s*(.*)$/);
  if (splitMatch && splitMatch[1] && splitMatch[2]) {
    return [splitMatch[1].trim(), splitMatch[2].trim()];
  }
  if (raw.length > 20) {
    const mid = Math.floor(raw.length / 2);
    const spaceIdx = raw.indexOf(" ", mid - 4);
    if (spaceIdx !== -1) {
      return [raw.substring(0, spaceIdx).trim(), raw.substring(spaceIdx).trim()];
    }
  }
  return [raw, ""];
}

// 제일엔지니어링 영문 뒷면 주소 (2줄) 스마트 래핑 및 동적 분할 처리
export function getCheilBackAddressLines(back: any, maxChars = 38): [string, string] {
  const raw1 = (back?.address1 || "").trim();
  const raw2 = (back?.address2 || "").trim();

  if (!raw1 && !raw2) {
    return ["", ""];
  }

  if (raw1.length <= maxChars && raw2.length <= maxChars) {
    return [raw1, raw2];
  }

  const fullText = [raw1, raw2].filter(Boolean).join(" ").replace(/\s+/g, " ");
  const words = fullText.split(" ");
  const lines: string[] = ["", ""];
  let currentLineIdx = 0;

  for (const word of words) {
    if (currentLineIdx >= 2) break;

    const testLine = lines[currentLineIdx]
      ? `${lines[currentLineIdx]} ${word}`
      : word;

    if (testLine.length <= maxChars) {
      lines[currentLineIdx] = testLine;
    } else {
      if (currentLineIdx < 1) {
        currentLineIdx++;
        lines[currentLineIdx] = word;
      } else {
        lines[currentLineIdx] = testLine;
      }
    }
  }

  return [lines[0] || "", lines[1] || ""];
}

// 한미글로벌 영문 뒷면 주소 (3줄) 스마트 래핑 및 동적 분할 처리
export function getHanmiBackAddressLines(back: any, maxChars = 37): [string, string, string] {
  const raw1 = (back?.address1 || "").trim();
  const raw2 = (back?.address2 || "").trim();
  const raw3 = (back?.address3 || "").trim();

  if (!raw1 && !raw2 && !raw3) {
    return ["", "", ""];
  }

  // 각 행이 37자 이하로 안전하면 유저가 직접 나눈 줄바꿈 그대로 보존
  if (raw1.length <= maxChars && raw2.length <= maxChars && raw3.length <= maxChars) {
    return [raw1, raw2, raw3];
  }

  // 37자 초과 길거나 1개 필드에 붙어들어온 경우 단어 단위 자동 스마트 래핑
  const fullText = [raw1, raw2, raw3].filter(Boolean).join(" ").replace(/\s+/g, " ");
  const words = fullText.split(" ");
  const lines: string[] = ["", "", ""];
  let currentLineIdx = 0;

  for (const word of words) {
    if (currentLineIdx >= 3) break;

    const testLine = lines[currentLineIdx]
      ? `${lines[currentLineIdx]} ${word}`
      : word;

    if (testLine.length <= maxChars) {
      lines[currentLineIdx] = testLine;
    } else {
      if (currentLineIdx < 2) {
        currentLineIdx++;
        lines[currentLineIdx] = word;
      } else {
        lines[currentLineIdx] = testLine;
      }
    }
  }

  return [
    lines[0] || "",
    lines[1] || "",
    lines[2] || "",
  ];
}

export default function SvgBusinessCardPreview({
  templateId = "T_CHEIL",
  cardData,
  isBack = false,
  scale = 1.0,
}: SvgBusinessCardPreviewProps) {
  const front = cardData.front || {};
  const back = cardData.back || {};

  const tidStr = String(templateId || "").toLowerCase();
  const isCheilOffice = isCheilOfficeTemplate(templateId);
  const isSingleSided = isSingleSidedTemplate(templateId);

  if (isSingleSided && isBack) {
    return null;
  }

  const key = tidStr.includes("hanmi") || tidStr === "3" ? "hanmi" : "cheil";
  const specGroup = CARD_TEMPLATE_SPECS[key] || CARD_TEMPLATE_SPECS.cheil;
  const config = isBack ? specGroup.back : specGroup.front;

  const currentData = isBack ? back : front;

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

  // 웨일 광고 차단기 및 로컬 네트워크 필터 우회용 Base64 인라인 데이터 URL
  const [logoBase64, setLogoBase64] = useState<string>(config.logoUrl || "");

  useEffect(() => {
    let isMounted = true;
    if (!config.logoUrl) {
      setLogoBase64("");
      return;
    }
    fetch(config.logoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted && typeof reader.result === "string") {
            setLogoBase64(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        if (isMounted) setLogoBase64(config.logoUrl || "");
      });

    return () => {
      isMounted = false;
    };
  }, [config.logoUrl]);

  // scale 조절용 랩핑 style
  const containerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  };

  // 로고 사양 (기본값 설정)
  const logoSpec = config.logoSpec || {
    x: key === "cheil" ? 35 : 30,
    y: key === "cheil" ? 42 : 48,
    width: key === "cheil" ? 145 : 150,
    height: 50,
  };

  const sloganSpec = config.sloganSpec || {
    x: 35,
    y: 239,
    width: 152,
    height: 17.5,
  };

  const imageSrc = logoBase64 || config.logoUrl;

  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-slate-50/60 p-1 md:p-2 overflow-hidden">
      <div style={containerStyle} className="w-full max-w-[519px] transition-transform duration-150 ease-out flex justify-center">
        <svg
          viewBox={config.viewBox}
          width="519"
          height="288.333"
          className="w-full max-w-[519px] aspect-[90/50] rounded bg-white shadow-xl ring-1 ring-slate-900/10 select-none"
          style={{
            fontFamily: key === "hanmi"
              ? "'NanumSquare', 'Pretendard Variable', Pretendard, sans-serif"
              : "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            colorScheme: "light",
            forcedColorAdjust: "none",
          }}
        >
          <defs>
            <style>{`
              @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
              text { forced-color-adjust: none; color-scheme: light; }
            `}</style>
          </defs>
          {/* 하단 풀 블레이드 바 (제일엔지니어링만 사용, 한미글로벌은 백그라운드 클린) */}
          {config.showBottomBar && (
            key === "cheil" ? (
              <>
                <rect x="0" y="278" width="519" height="15" fill="#003876" />
                <rect x="0" y="278" width="78" height="15" fill="#55b936" />
              </>
            ) : (
              <rect x="0" y="283" width="519" height="10" fill="#004B96" />
            )
          )}

          {/* 좌측: 로고 이미지 (앞/뒷면 개별 사양 적용 및 웨일 브라우저 Base64/xlinkHref 레거시 호환) */}
          {imageSrc && (
            <image
              href={imageSrc}
              xlinkHref={imageSrc}
              x={logoSpec.x}
              y={logoSpec.y}
              width={logoSpec.width}
              height={logoSpec.height}
              preserveAspectRatio="xMinYMin meet"
            />
          )}

          {/* 좌측 하단: 슬로건 ("Smiling Technology" -> /cheil/cheil_smile.jpg 이미지 교체) */}
          {config.showSlogan && (
            <image
              href="/cheil/cheil_smile.jpg"
              xlinkHref="/cheil/cheil_smile.jpg"
              x={sloganSpec.x}
              y={sloganSpec.y}
              width={sloganSpec.width}
              height={sloganSpec.height}
              preserveAspectRatio="xMinYMin meet"
            />
          )}

          {/* 중앙 세로 구분선 (필요시에만) */}
          {config.showCenterLine && (
            <line x1="205" y1="35" x2="205" y2="255" stroke="#E2E8F0" strokeWidth="1" />
          )}

          {/* 1. 성명 */}
          {config.fields.name && (
            <text
              x={config.fields.name.x}
              y={config.fields.name.y}
              fontSize={config.fields.name.fontSize}
              fontWeight={config.fields.name.fontWeight || "700"}
              fill={config.fields.name.fill || "#0f172a"}
              letterSpacing={!isBack && key === "cheil" ? "0.35em" : !isBack ? "0.25em" : "normal"}
              dominantBaseline="hanging"
            >
              {!isBack
                ? formatKoreanName(front.name)
                : back.name || ""}
            </text>
          )}

          {/* 2. 부서 및 직급 */}
          {!isBack ? (
            isCheilOffice ? (
              <>
                {front.department && (
                  <text
                    x={220}
                    y={60}
                    fontSize={12.5}
                    fontWeight="500"
                    fill="#1e293b"
                    dominantBaseline="hanging"
                  >
                    {front.department}
                  </text>
                )}
                {(front.position1 || front.position2) && (
                  <text
                    x={220}
                    y={front.department ? 77 : 60}
                    fontSize={12.5}
                    fontWeight="500"
                    fill="#1e293b"
                    dominantBaseline="hanging"
                  >
                    {[front.position1, front.position2].filter(Boolean).join(" / ")}
                  </text>
                )}
              </>
            ) : (
              <>
                {config.fields.departmentPosition && (front.department || front.position1) && (
                  <text
                    x={config.fields.departmentPosition.x}
                    y={config.fields.departmentPosition.y}
                    fontSize={config.fields.departmentPosition.fontSize}
                    fontWeight={config.fields.departmentPosition.fontWeight || "500"}
                    fill={config.fields.departmentPosition.fill || "#1e293b"}
                    dominantBaseline="hanging"
                  >
                    {key === "cheil"
                      ? [front.department, front.position1].filter(Boolean).join(" / ")
                      : [front.position1, front.department].filter(Boolean).join(" / ")}
                  </text>
                )}
                {front.position2 && (
                  <text
                    x={config.fields.position2?.x || 268}
                    y={config.fields.position2?.y || 94}
                    fontSize={config.fields.position2?.fontSize || 12.2}
                    fontWeight={config.fields.position2?.fontWeight || "700"}
                    fill={config.fields.position2?.fill || "#1e293b"}
                    dominantBaseline="hanging"
                  >
                    {front.position2}
                  </text>
                )}
              </>
            )
          ) : (
            <>
              {config.fields.position1 && back.position1 && (
                <text
                  x={config.fields.position1.x}
                  y={config.fields.position1.y}
                  fontSize={config.fields.position1.fontSize}
                  fontWeight={config.fields.position1.fontWeight || "400"}
                  fill={config.fields.position1.fill || "#1e293b"}
                  dominantBaseline="hanging"
                >
                  {back.department && back.department.trim() !== ""
                    ? (back.position1.endsWith("/") ? back.position1 : `${back.position1} /`)
                    : back.position1.replace(/\/$/, "").trim()}
                </text>
              )}
              {config.fields.department && back.department && (
                <text
                  x={config.fields.department.x}
                  y={config.fields.department.y}
                  fontSize={config.fields.department.fontSize}
                  fontWeight={config.fields.department.fontWeight || "400"}
                  fill={config.fields.department.fill || "#1e293b"}
                  dominantBaseline="hanging"
                >
                  {back.department}
                </text>
              )}
              {key === "hanmi" && back.position2 && (
                <text
                  x={268}
                  y={108}
                  fontSize={12.2}
                  fontWeight="700"
                  fill="#1e293b"
                  dominantBaseline="hanging"
                >
                  {back.position2}
                </text>
              )}
            </>
          )}

          {/* 3. 회사명 (제일엔지니어링 & 한미글로벌 고객 아웃라인 자산 이미지) */}
          {config.fields.companyName && (
            key === "hanmi" ? (
              <image
                href={!isBack ? "/hanmi/hanmi_front_name.jpg" : "/hanmi/hanmi_back_name.jpg"}
                xlinkHref={!isBack ? "/hanmi/hanmi_front_name.jpg" : "/hanmi/hanmi_back_name.jpg"}
                x={config.fields.companyName.x}
                y={cardY.companyName}
                width={!isBack ? 143.7 : 159.9}
                height={14.2}
                preserveAspectRatio="xMinYMin meet"
              />
            ) : (
              <image
                href={!isBack ? (tidStr === "4" || tidStr.includes("cheil_front_name") ? "/cheil/cheil_front_name.jpg" : "/cheil/cheil_build_front_name.jpg") : "/cheil/cheil_back_name.jpg"}
                xlinkHref={!isBack ? (tidStr === "4" || tidStr.includes("cheil_front_name") ? "/cheil/cheil_front_name.jpg" : "/cheil/cheil_build_front_name.jpg") : "/cheil/cheil_back_name.jpg"}
                x={config.fields.companyName.x}
                y={key === "cheil" ? cheilY.companyName : (!isBack ? (tidStr === "4" || tidStr.includes("cheil_front_name") ? config.fields.companyName.y - 1 : config.fields.companyName.y) : config.fields.companyName.y)}
                width={!isBack ? 217.6 : 216.5}
                height={!isBack ? 13.8 : 8.8}
                preserveAspectRatio="xMinYMin meet"
              />
            )
          )}

          {/* 4. 대표전화 & 팩스 한 줄 렌더링 (제일엔지니어링 전용) */}
          {key === "cheil" && config.fields.telAndFax && (currentData.telephone || currentData.fax) && (
            <text
              x={config.fields.telAndFax.x}
              y={key === "cheil" ? cheilY.telAndFax : config.fields.telAndFax.y}
              fontSize={config.fields.telAndFax.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {!isBack
                ? `${currentData.telephone ? `${isCheilOffice ? "전화 :" : "대표 :"} ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}`
                : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`}
            </text>
          )}

          {/* 5. 한미글로벌 전용 대표전화 (+82 국가번호 반영 및 X=301 칼선 정렬) */}
          {key === "hanmi" && config.fields.telephone && currentData.telephone && (
            <text
              x={config.fields.telephone.x}
              y={cardY.telephone}
              fontSize={config.fields.telephone.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              <tspan x={config.fields.telephone.x} fontWeight="400" fill="#1e293b">
                T
              </tspan>
              <tspan x={config.fields.telephone.x + 16}>
                {currentData.telephone.startsWith("+82")
                  ? currentData.telephone
                  : `+82 (0)${currentData.telephone.replace(/^0/, "")}`}
              </tspan>
            </text>
          )}

          {/* 6. 직통번호 (Dir) */}
          {config.fields.directTelephone && currentData.directTelephone && (
            <text
              x={config.fields.directTelephone.x}
              y={key === "cheil" ? cheilY.directTel : config.fields.directTelephone.y}
              fontSize={config.fields.directTelephone.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {key === "cheil"
                ? !isBack
                  ? `직통 : ${currentData.directTelephone}`
                  : `Dir: ${currentData.directTelephone}`
                : `Dir ${currentData.directTelephone}`}
            </text>
          )}

          {/* 7. 핸드폰 (Mobile - regular weight & X=301 칼선 정렬) */}
          {config.fields.mobile && currentData.mobile && (
            <text
              x={config.fields.mobile.x}
              y={key === "cheil" ? cheilY.mobile : (key === "hanmi" ? cardY.mobile : config.fields.mobile.y)}
              fontSize={config.fields.mobile.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {key === "cheil" ? (
                !isBack
                  ? `핸드폰 : ${currentData.mobile}`
                  : `Mobile: ${currentData.mobile}`
              ) : (
                <>
                  <tspan x={config.fields.mobile.x} fontWeight="400" fill="#1e293b">
                    M
                  </tspan>
                  <tspan x={config.fields.mobile.x + 16}>
                    {currentData.mobile.startsWith("+82")
                      ? currentData.mobile
                      : `+82 (0)${currentData.mobile.replace(/^0/, "")}`}
                  </tspan>
                </>
              )}
            </text>
          )}

          {/* 8. 이메일 (E-mail - regular weight & X=301 칼선 정렬) */}
          {config.fields.email && currentData.email && (
            <text
              x={config.fields.email.x}
              y={key === "cheil" ? cheilY.email : (key === "hanmi" ? cardY.email : config.fields.email.y)}
              fontSize={config.fields.email.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {key === "cheil" ? (
                `E-mail: ${currentData.email}`
              ) : (
                <>
                  <tspan x={config.fields.email.x} fontWeight="400" fill="#1e293b">
                    E
                  </tspan>
                  <tspan x={config.fields.email.x + 16}>
                    {currentData.email}
                  </tspan>
                </>
              )}
            </text>
          )}

          {/* 9. 웹사이트 (Website) */}
          {config.fields.website && currentData.website && (
            <text
              x={config.fields.website.x}
              y={key === "cheil" ? cheilY.website : (key === "hanmi" ? cardY.website : config.fields.website.y)}
              fontSize={config.fields.website.fontSize}
              fontWeight={key === "cheil" ? "700" : "500"}
              fill={config.fields.website.fill || "#004B96"}
              dominantBaseline="hanging"
            >
              {currentData.website}
            </text>
          )}

          {/* 10. 주소 (Address & Field Address) */}
          {isCheilOffice && !isBack ? (
            <>
              {front.address && (
                <text
                  x={config.fields.address?.x || 220}
                  y={cheilY.address}
                  fontSize={config.fields.address?.fontSize || 10}
                  fontWeight="400"
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  {front.address.startsWith("본사") ? (front.address.startsWith("본사 :") ? front.address : front.address.replace(/^본사\s*:?\s*/, "본사 : ")) : `본사 : ${front.address}`}
                </text>
              )}
              {front.fieldAddress && (
                <text
                  x={config.fields.address?.x || 220}
                  y={cheilY.fieldAddress}
                  fontSize={config.fields.address?.fontSize || 10}
                  fontWeight="400"
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  {front.fieldAddress.startsWith("현장") ? (front.fieldAddress.startsWith("현장 :") ? front.fieldAddress : front.fieldAddress.replace(/^현장\s*:?\s*/, "현장 : ")) : `현장 : ${front.fieldAddress}`}
                </text>
              )}
            </>
          ) : key === "cheil" && config.fields.address && front.address && (
            <text
              x={config.fields.address.x}
              y={cheilY.address}
              fontSize={config.fields.address.fontSize}
              fontWeight="400"
              fill="#334155"
              dominantBaseline="hanging"
            >
              {front.address}
            </text>
          )}

          {key === "hanmi" && !isBack && (() => {
            const [addr1, addr2] = getHanmiFrontAddressLines(front);
            return (
              <>
                <text
                  x={config.fields.address1?.x}
                  y={cardY.address1}
                  fontSize={config.fields.address1?.fontSize}
                  fontWeight="400"
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  {addr1}
                </text>
                {addr2 && (
                  <text
                    x={config.fields.address2?.x}
                    y={cardY.address2}
                    fontSize={config.fields.address2?.fontSize}
                    fontWeight="400"
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {addr2}
                  </text>
                )}
              </>
            );
          })()}

          {/* 영문 주소 (address1, address2, address3) */}
          {isBack && (
            key === "cheil" ? (() => {
              const [c1, c2] = getCheilBackAddressLines(back);
              return (
                <>
                  <text
                    x={config.fields.address1?.x}
                    y={cheilY.address1}
                    fontSize={config.fields.address1?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {c1}
                  </text>
                  <text
                    x={config.fields.address2?.x}
                    y={cheilY.address2}
                    fontSize={config.fields.address2?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {c2}
                  </text>
                </>
              );
            })() : (() => {
              const [b1, b2, b3] = getHanmiBackAddressLines(back);
              return (
                <>
                  <text
                    x={config.fields.address1?.x}
                    y={cardY.address1}
                    fontSize={config.fields.address1?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {b1}
                  </text>
                  {b2 && (
                    <text
                      x={config.fields.address2?.x}
                      y={cardY.address2}
                      fontSize={config.fields.address2?.fontSize}
                      fill="#334155"
                      dominantBaseline="hanging"
                    >
                      {b2}
                    </text>
                  )}
                  {b3 && (
                    <text
                      x={config.fields.address3?.x}
                      y={cardY.address3}
                      fontSize={config.fields.address3?.fontSize}
                      fill="#334155"
                      dominantBaseline="hanging"
                    >
                      {b3}
                    </text>
                  )}
                </>
              );
            })()
          )}
        </svg>
      </div>
    </div>
  );
}
