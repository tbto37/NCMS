import React, { useState, useEffect } from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import { CARD_TEMPLATE_SPECS } from "@/shared/constants/cardTemplates";

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
  const key = tidStr.includes("hanmi") || tidStr === "3" ? "hanmi" : "cheil";
  const specGroup = CARD_TEMPLATE_SPECS[key] || CARD_TEMPLATE_SPECS.cheil;
  const config = isBack ? specGroup.back : specGroup.front;

  const currentData = isBack ? back : front;

  // 제일엔지니어링 직통번호 유무에 따른 수직 줄간격(Line Spacing) 동적 연산
  const hasDirectTel = Boolean(currentData?.directTelephone && currentData.directTelephone.trim() !== "");
  const cheilY = {
    directTel: !isBack ? 174 : 191,
    mobile: !isBack ? (hasDirectTel ? 192 : 174) : (hasDirectTel ? 209 : 191),
    email: !isBack ? (hasDirectTel ? 210 : 192) : (hasDirectTel ? 227 : 209),
    website: !isBack ? (hasDirectTel ? 232 : 214) : (hasDirectTel ? 247 : 229),
  };

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
              x="34"
              y="227"
              width="124"
              height="14"
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
                  {back.position1.endsWith("/")
                    ? back.position1
                    : `${back.position1} /`}
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
                y={config.fields.companyName.y - 2}
                width={!isBack ? 143.7 : 159.9}
                height={14.2}
                preserveAspectRatio="xMinYMin meet"
              />
            ) : (
              <image
                href={!isBack ? "/cheil/cheil_build_front_name.jpg" : "/cheil/cheil_back_name.jpg"}
                xlinkHref={!isBack ? "/cheil/cheil_build_front_name.jpg" : "/cheil/cheil_back_name.jpg"}
                x={config.fields.companyName.x}
                y={!isBack ? config.fields.companyName.y - 1 : config.fields.companyName.y}
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
              y={config.fields.telAndFax.y}
              fontSize={config.fields.telAndFax.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {!isBack
                ? `${currentData.telephone ? `대표 : ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `팩스 : ${currentData.fax}` : ""}`
                : `${currentData.telephone ? `Tel: ${currentData.telephone}` : ""}${currentData.telephone && currentData.fax ? "   " : ""}${currentData.fax ? `Fax: ${currentData.fax}` : ""}`}
            </text>
          )}

          {/* 5. 한미글로벌 전용 대표전화 (+82 국가번호 반영 및 X=301 칼선 정렬) */}
          {key === "hanmi" && config.fields.telephone && currentData.telephone && (
            <text
              x={config.fields.telephone.x}
              y={config.fields.telephone.y}
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
              y={key === "cheil" ? cheilY.mobile : config.fields.mobile.y}
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
              y={key === "cheil" ? cheilY.email : config.fields.email.y}
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
              y={key === "cheil" ? cheilY.website : config.fields.website.y}
              fontSize={config.fields.website.fontSize}
              fontWeight={key === "cheil" ? "700" : "500"}
              fill={config.fields.website.fill || "#004B96"}
              dominantBaseline="hanging"
            >
              {currentData.website}
            </text>
          )}

          {/* 10. 주소 (Address) */}
          {key === "cheil" && config.fields.address && front.address && (
            <text
              x={config.fields.address.x}
              y={config.fields.address.y}
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
                  y={config.fields.address1?.y}
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
                    y={config.fields.address2?.y}
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
                    y={config.fields.address1?.y}
                    fontSize={config.fields.address1?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {c1}
                  </text>
                  <text
                    x={config.fields.address2?.x}
                    y={config.fields.address2?.y}
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
                    y={config.fields.address1?.y}
                    fontSize={config.fields.address1?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {b1}
                  </text>
                  <text
                    x={config.fields.address2?.x}
                    y={config.fields.address2?.y}
                    fontSize={config.fields.address2?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {b2}
                  </text>
                  <text
                    x={config.fields.address3?.x}
                    y={config.fields.address3?.y}
                    fontSize={config.fields.address3?.fontSize}
                    fill="#334155"
                    dominantBaseline="hanging"
                  >
                    {b3}
                  </text>
                </>
              );
            })()
          )}
        </svg>
      </div>
    </div>
  );
}
