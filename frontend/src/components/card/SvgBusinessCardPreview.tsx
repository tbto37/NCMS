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
      front?.address1 || "06164, 서울시 강남구 테헤란로 87길",
      front?.address2 || "36 도심공항타워",
    ];
  }
  const raw = (front?.address || "").trim();
  if (!raw) {
    return ["06164, 서울시 강남구 테헤란로 87길", "36 도심공항타워"];
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
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
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

          {/* 좌측 하단: 슬로건 ("Smiling Technology" - a파도소리 13.5pt, K80 농도, -7deg skewX 기울임, X=34) */}
          {config.showSlogan && (
            <text
              x="34"
              y="230"
              fontSize="13.5"
              fontWeight="700"
              fill="#333333"
              fontFamily="'a파도소리', 'aPadosori', 'Georgia', serif"
              transform="translate(34, 230) skewX(-7) translate(-34, -230)"
              dominantBaseline="hanging"
            >
              {config.sloganText || '"Smiling Technology"'}
            </text>
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
                ? formatKoreanName(front.name) || "백    승    연"
                : back.name || "Rosy Baek"}
            </text>
          )}

          {/* 2. 부서 및 직급 */}
          {!isBack ? (
            <>
              {config.fields.departmentPosition && (
                <text
                  x={config.fields.departmentPosition.x}
                  y={config.fields.departmentPosition.y}
                  fontSize={config.fields.departmentPosition.fontSize}
                  fontWeight={config.fields.departmentPosition.fontWeight || "500"}
                  fill={config.fields.departmentPosition.fill || "#1e293b"}
                  dominantBaseline="hanging"
                >
                  {key === "cheil"
                    ? [front.department, front.position1].filter(Boolean).join(" / ") || "도로사업부 / 이사"
                    : [front.position1, front.department].filter(Boolean).join(" / ") || "프로 / 경영지원팀"}
                </text>
              )}
              {config.fields.position2 && (
                <text
                  x={config.fields.position2.x}
                  y={config.fields.position2.y}
                  fontSize={config.fields.position2.fontSize}
                  fontWeight={config.fields.position2.fontWeight || "400"}
                  fill={config.fields.position2.fill || "#475569"}
                  dominantBaseline="hanging"
                >
                  {front.position2 || "도로 및 공항 기술사"}
                </text>
              )}
            </>
          ) : (
            <>
              {config.fields.position1 && (
                <text
                  x={config.fields.position1.x}
                  y={config.fields.position1.y}
                  fontSize={config.fields.position1.fontSize}
                  fontWeight={config.fields.position1.fontWeight || "400"}
                  fill={config.fields.position1.fill || "#1e293b"}
                  dominantBaseline="hanging"
                >
                  {back.position1
                    ? back.position1.endsWith("/")
                      ? back.position1
                      : `${back.position1} /`
                    : key === "cheil"
                    ? "Director / P.E."
                    : "Professional /"}
                </text>
              )}
              {config.fields.department && (
                <text
                  x={config.fields.department.x}
                  y={config.fields.department.y}
                  fontSize={config.fields.department.fontSize}
                  fontWeight={config.fields.department.fontWeight || "400"}
                  fill={config.fields.department.fill || "#1e293b"}
                  dominantBaseline="hanging"
                >
                  {back.department || (key === "cheil" ? "Highway Eng. Business Div." : "Management Support Team")}
                </text>
              )}
            </>
          )}

          {/* 3. 회사명 (제일엔지니어링: HY울릉도M 지정 폰트, 한미글로벌: Hanmi(Bold)+Global Co.,Ltd.(Regular)) */}
          {config.fields.companyName && (
            <text
              x={config.fields.companyName.x}
              y={config.fields.companyName.y}
              fontSize={config.fields.companyName.fontSize}
              fontWeight={config.fields.companyName.fontWeight || "700"}
              fill={config.fields.companyName.fill || "#0f172a"}
              fontFamily={config.fields.companyName.fontFamily || (key === "cheil" ? "'HY울릉도M', HYUlsungdoM, 'HYPMokGak-Medium', serif" : "inherit")}
              dominantBaseline="hanging"
            >
              {!isBack ? (
                key === "cheil" ? "(주)제일엔지니어링종합건축사사무소" : "한미글로벌 주식회사"
              ) : key === "cheil" ? (
                "CHEIL ENGINEERING CO.,LTD."
              ) : (
                <>
                  <tspan fontWeight="700" fill="#0f172a">
                    Hanmi
                  </tspan>
                  <tspan fontWeight="400" fill="#334155">
                    Global Co.,Ltd.
                  </tspan>
                </>
              )}
            </text>
          )}

          {/* 4. 대표전화 & 팩스 한 줄 렌더링 (제일엔지니어링 전용) */}
          {key === "cheil" && config.fields.telAndFax && (
            <text
              x={config.fields.telAndFax.x}
              y={config.fields.telAndFax.y}
              fontSize={config.fields.telAndFax.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {!isBack
                ? `대표 : ${currentData.telephone || "02-000-0000"}   팩스 : ${currentData.fax || "02-000-0000"}`
                : `Tel: ${currentData.telephone || "82-2-000-0000"}   Fax: ${currentData.fax || "82-2-000-0000"}`}
            </text>
          )}

          {/* 5. 한미글로벌 전용 대표전화 (+82 국가번호 반영 및 X=301 칼선 정렬) */}
          {key === "hanmi" && config.fields.telephone && (
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
                {currentData.telephone
                  ? currentData.telephone.startsWith("+82")
                    ? currentData.telephone
                    : `+82 (0)${currentData.telephone.replace(/^0/, "")}`
                  : "+82 (0)10-6379-1882"}
              </tspan>
            </text>
          )}

          {/* 6. 직통번호 (Dir) */}
          {config.fields.directTelephone && (key === "cheil" ? hasDirectTel : currentData.directTelephone) && (
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
                : `Dir ${currentData.directTelephone || "02-3498-2662"}`}
            </text>
          )}

          {/* 7. 핸드폰 (Mobile - regular weight & X=301 칼선 정렬) */}
          {config.fields.mobile && (
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
                  ? `핸드폰 : ${currentData.mobile || "010-1234-5678"}`
                  : `Mobile: ${currentData.mobile || "82-10-1234-5678"}`
              ) : (
                <>
                  <tspan x={config.fields.mobile.x} fontWeight="400" fill="#1e293b">
                    M
                  </tspan>
                  <tspan x={config.fields.mobile.x + 16}>
                    {currentData.mobile
                      ? currentData.mobile.startsWith("+82")
                        ? currentData.mobile
                        : `+82 (0)${currentData.mobile.replace(/^0/, "")}`
                      : "+82 (0)70-7188-2199"}
                  </tspan>
                </>
              )}
            </text>
          )}

          {/* 8. 이메일 (E-mail - regular weight & X=301 칼선 정렬) */}
          {config.fields.email && (
            <text
              x={config.fields.email.x}
              y={key === "cheil" ? cheilY.email : config.fields.email.y}
              fontSize={config.fields.email.fontSize}
              fontWeight="400"
              fill="#1e293b"
              dominantBaseline="hanging"
            >
              {key === "cheil" ? (
                `E-mail: ${currentData.email || "00000@naver.com"}`
              ) : (
                <>
                  <tspan x={config.fields.email.x} fontWeight="400" fill="#1e293b">
                    E
                  </tspan>
                  <tspan x={config.fields.email.x + 16}>
                    {currentData.email || "baeksy@hanmiglobal.com"}
                  </tspan>
                </>
              )}
            </text>
          )}

          {/* 9. 웹사이트 (Website) */}
          {config.fields.website && (
            <text
              x={config.fields.website.x}
              y={key === "cheil" ? cheilY.website : config.fields.website.y}
              fontSize={config.fields.website.fontSize}
              fontWeight={key === "cheil" ? "700" : "500"}
              fill={config.fields.website.fill || "#004B96"}
              dominantBaseline="hanging"
            >
              {currentData.website || (key === "cheil" ? "www.cheileng.com" : "www.hanmiglobal.com")}
            </text>
          )}

          {/* 10. 주소 (Address) */}
          {key === "cheil" && config.fields.address && (
            <text
              x={config.fields.address.x}
              y={config.fields.address.y}
              fontSize={config.fields.address.fontSize}
              fontWeight="400"
              fill="#334155"
              dominantBaseline="hanging"
            >
              {front.address || "06779 서울시 서초구 강남대로16길 22-6(양재동)"}
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
            key === "cheil" ? (
              <>
                <text
                  x={config.fields.address1?.x}
                  y={config.fields.address1?.y}
                  fontSize={config.fields.address1?.fontSize}
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  {back.address1 || "22-6, Gangnamdaero 16gil, Seocho-gu,"}
                </text>
                <text
                  x={config.fields.address2?.x}
                  y={config.fields.address2?.y}
                  fontSize={config.fields.address2?.fontSize}
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  {back.address2 || "Seoul, Korea (06779)"}
                </text>
              </>
            ) : (
              <>
                <text
                  x={config.fields.address1?.x}
                  y={config.fields.address1?.y}
                  fontSize={config.fields.address1?.fontSize}
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  City Air Tower Bldg., 36, Teheran-ro
                </text>
                <text
                  x={config.fields.address2?.x}
                  y={config.fields.address2?.y}
                  fontSize={config.fields.address2?.fontSize}
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  87-gil, Gangnam-gu, Seoul, 06164,
                </text>
                <text
                  x={config.fields.address3?.x}
                  y={config.fields.address3?.y}
                  fontSize={config.fields.address3?.fontSize}
                  fill="#334155"
                  dominantBaseline="hanging"
                >
                  Korea
                </text>
              </>
            )
          )}
        </svg>
      </div>
    </div>
  );
}
