import React from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";

interface DynamicBusinessCardPreviewProps {
  templateId?: number | string;
  cardData: BusinessCardInputData;
  isBack?: boolean;
  scale?: number;
}

// 한글 이름 자간 포맷팅 (예: "홍길동" -> "홍    길    동", "백승연" -> "백    승    연")
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

export default function DynamicBusinessCardPreview({
  templateId = "T_CHEIL",
  cardData,
  isBack = false,
  scale = 1.0,
}: DynamicBusinessCardPreviewProps) {
  const front = cardData.front || {};
  const back = cardData.back || {};

  const tidStr = String(templateId || "").toLowerCase();
  const isHanmi = tidStr.includes("hanmi") || tidStr === "3";

  // scale 조절용 랩핑 style
  const containerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  };

  if (isHanmi) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-4 overflow-hidden">
        <div style={containerStyle} className="transition-transform duration-150 ease-out">
          {!isBack ? (
            /* ==================== 한미글로벌 앞면 (한글) ==================== */
            <div
              style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
              className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 p-6 flex flex-col justify-between select-none text-slate-800"
            >
              {/* 상단: 로고 (좌) vs 이름/직급 (우) */}
              <div className="flex items-start justify-between">
                <div className="pt-1">
                  <img
                    src="/logos/hanmi_front_logo.png"
                    alt="한미글로벌 로고"
                    className="h-10 object-contain"
                  />
                </div>

                <div className="text-right">
                  <div className="text-[17px] font-extrabold text-slate-900 tracking-wider">
                    {formatKoreanName(front.name) || "백   승   연"}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-1">
                    {[front.position1, front.department].filter(Boolean).join(" / ") || "프로 / 경영지원팀"}
                  </div>
                </div>
              </div>

              {/* 하단: 회사명 및 상세 연락처 */}
              <div className="mt-auto pt-2 flex flex-col items-end text-right">
                <div className="text-[11px] font-bold text-slate-900 mb-1.5">한미글로벌 주식회사</div>
                <div className="space-y-0.5 text-[9.5px] leading-tight text-slate-600 font-medium tracking-tight">
                  <div className="flex justify-end gap-1.5">
                    <span className="font-bold text-slate-800">T</span>
                    <span>{front.telephone || "+82 (0)10-6379-1882"}</span>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <span className="font-bold text-slate-800">M</span>
                    <span>{front.mobile || "+82 (0)70-7188-2199"}</span>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <span className="font-bold text-slate-800">E</span>
                    <span>{front.email || "baeksy@hanmiglobal.com"}</span>
                  </div>
                  <div className="pt-1 text-[9px] text-slate-500 font-normal leading-snug">
                    {front.address || "06164, 서울시 강남구 테헤란로 87길 36 도심공항타워"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== 한미글로벌 뒷면 (영문) ==================== */
            <div
              style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
              className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 p-6 flex flex-col justify-between select-none text-slate-800"
            >
              {/* 상단: 영문 로고 & 영문 이름 */}
              <div className="flex items-start justify-between">
                <div className="pt-1">
                  <img
                    src="/logos/hanmi_back_logo.png"
                    alt="HanmiGlobal Logo"
                    className="h-10 object-contain"
                  />
                </div>

                <div className="text-right">
                  <div className="text-[17px] font-bold text-slate-900">
                    {back.name || "Rosy Baek"}
                  </div>
                  <div className="text-[9.5px] font-medium text-slate-600 mt-1 leading-tight">
                    <div>{back.position1 || "Professional"} /</div>
                    <div>{back.department || "Management Support Team"}</div>
                  </div>
                </div>
              </div>

              {/* 하단: 영문 회사명 & 주소 */}
              <div className="mt-auto pt-2 flex flex-col items-end text-right">
                <div className="text-[11px] font-bold text-slate-900">HanmiGlobal Co.,Ltd.</div>
                <div className="text-[9.5px] font-semibold text-[#004B96] my-0.5">
                  {back.website || "www.hanmiglobal.com"}
                </div>
                <div className="text-[8.5px] leading-tight text-slate-500 font-normal max-w-[260px]">
                  {back.address1 || "City Air Tower Bldg., 36, Teheran-ro 87-gil, Gangnam-gu, Seoul, 06164, Korea"}
                  {back.address2 && <div>{back.address2}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==================== 제일엔지니어링 (T_CHEIL) ==================== */
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-4 overflow-hidden">
      <div style={containerStyle} className="transition-transform duration-150 ease-out">
        {!isBack ? (
          /* 제일엔지니어링 앞면 */
          <div
            style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
            className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between select-none"
          >
            <div className="p-5 pl-6 pt-5 pb-3 flex-1 flex justify-between items-start">
              {/* 좌측: 로고 및 슬로건 */}
              <div className="h-full flex flex-col justify-between w-[125px] shrink-0">
                <div className="pt-0.5">
                  <img
                    src="/logos/cheil_logo.png"
                    alt="CHEIL 로고"
                    className="h-9 object-contain"
                  />
                </div>
                <div className="text-[10.5px] font-bold italic tracking-tight text-slate-800 font-serif pb-0.5">
                  “Smiling Technology”
                </div>
              </div>

              {/* 우측: 상세 명함 내용 (좌측 정렬) */}
              <div className="flex-1 pl-4 text-left flex flex-col justify-between h-full pt-0.5">
                <div>
                  <p className="text-[17px] font-bold text-slate-900 tracking-[0.25em]">
                    {formatKoreanName(front.name) || "홍    길    동"}
                  </p>
                  <p className="mt-1 text-[9.5px] text-slate-700 font-medium leading-tight">
                    {[front.department, front.position1].filter(Boolean).join(" / ") || "도로사업부 / 이사"}
                  </p>
                  <p className="text-[9px] text-slate-600 font-medium leading-tight">
                    {front.position2 || "도로 및 공항 기술사"}
                  </p>
                </div>

                <div className="space-y-[2px] text-[8.5px] leading-snug text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[10px] mb-1">
                    (주)제일엔지니어링
                  </p>
                  <p>{front.address || "06779 서울시 서초구 강남대로16길 22-6(양재동)"}</p>
                  <p>
                    대표 : {front.telephone || "02-3498-2600"} &nbsp; 팩스 : {front.fax || "02-572-8970"}
                  </p>
                  <p>직통 : {front.directTelephone || "02-3498-2662"}</p>
                  <p>핸드폰 : {front.mobile || "010-1234-5678"}</p>
                  <p>E-mail: {front.email || "youremail@email.com"}</p>
                  <p className="font-bold text-slate-900 text-[9px] pt-0.5">
                    {front.website || "www.cheileng.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* 명함 하단 풀 블레이드 스트라이프 바 (그린 15% + 딥블루 85%) */}
            <div className="flex h-2.5 w-full shrink-0">
              <div className="w-[15%] bg-[#55b936]" />
              <div className="w-[85%] bg-[#003876]" />
            </div>
          </div>
        ) : (
          /* 제일엔지니어링 뒷면 */
          <div
            style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
            className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between select-none"
          >
            <div className="p-5 pl-6 pt-5 pb-3 flex-1 flex justify-between items-start">
              {/* 좌측: 로고 및 슬로건 */}
              <div className="h-full flex flex-col justify-between w-[125px] shrink-0">
                <div className="pt-0.5">
                  <img
                    src="/logos/cheil_logo.png"
                    alt="CHEIL Logo"
                    className="h-9 object-contain"
                  />
                </div>
                <div className="text-[10.5px] font-bold italic tracking-tight text-slate-800 font-serif pb-0.5">
                  “Smiling Technology”
                </div>
              </div>

              {/* 우측: 영문 상세 내용 (좌측 정렬) */}
              <div className="flex-1 pl-4 text-left flex flex-col justify-between h-full pt-0.5">
                <div>
                  <p className="text-[17px] font-bold text-slate-900">
                    {back.name || "Hong Gil Dong"}
                  </p>
                  <p className="mt-1 text-[9.5px] text-slate-700 font-medium leading-tight">
                    {back.department || "Highway Eng. Business Div."}
                  </p>
                  <p className="text-[9px] text-slate-600 font-medium leading-tight">
                    {[back.position1, back.position2].filter(Boolean).join(" / ") || "Director / P.E."}
                  </p>
                </div>

                <div className="space-y-[2px] text-[8.5px] leading-snug text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[9.5px] mb-1 tracking-tight">
                    CHEIL ENGINEERING CO.,LTD.
                  </p>
                  <p>{back.address1 || "22-6, Gangnamdaero 16gil, Seocho-gu,"}</p>
                  <p>{back.address2 || "Seoul, Korea (06779)"}</p>
                  <p>
                    Tel: {back.telephone || "82-2-3498-2600"} Fax: {back.fax || "82-2-572-8970"}
                  </p>
                  <p>Dir: {back.directTelephone || "82-2-3498-2745"}</p>
                  <p>Mobile: {back.mobile || "82-10-1234-5678"}</p>
                  <p>E-mail: {back.email || "youremail@email.com"}</p>
                  <p className="font-bold text-slate-900 text-[9px] pt-0.5">
                    {back.website || "www.cheileng.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* 명함 하단 풀 블레이드 스트라이프 바 (그린 15% + 딥블루 85%) */}
            <div className="flex h-2.5 w-full shrink-0">
              <div className="w-[15%] bg-[#55b936]" />
              <div className="w-[85%] bg-[#003876]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
