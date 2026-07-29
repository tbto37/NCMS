import React from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";

interface DynamicBusinessCardPreviewProps {
  templateId?: number | string;
  cardData: BusinessCardInputData;
  isBack?: boolean;
  scale?: number;
}

// 한글 이름 자간 포맷팅 (예: "백승연" -> "백   승   연", "조우진" -> "조   우   진")
function formatKoreanName(nameStr?: string): string {
  if (!nameStr) return "";
  const trimmed = nameStr.replace(/\s+/g, "");
  if (trimmed.length === 3) {
    return `${trimmed[0]}   ${trimmed[1]}   ${trimmed[2]}`;
  }
  if (trimmed.length === 2) {
    return `${trimmed[0]}       ${trimmed[1]}`;
  }
  return nameStr;
}

export default function DynamicBusinessCardPreview({
  templateId = "T_HANMI",
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

              {/* 하단: 회사명 및 상세 연락처 (우측 정렬/배치) */}
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
            <div className="p-5 flex-1 flex justify-between items-start">
              {/* 좌측: 로고 및 슬로건 */}
              <div className="h-full flex flex-col justify-between">
                <div>
                  <img
                    src="/logos/cheil_logo.png"
                    alt="CHEIL 로고"
                    className="h-9 object-contain"
                  />
                </div>
                <div className="text-[11px] font-bold italic tracking-tight text-slate-700 font-serif">
                  “Smiling Technology”
                </div>
              </div>

              {/* 우측: 상세 명함 내용 */}
              <div className="text-right flex flex-col justify-between h-full pt-1">
                <div>
                  <p className="text-[17px] font-bold text-slate-900 tracking-wider">
                    {formatKoreanName(front.name) || "조   우   진"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-600 font-medium">
                    {[front.department, front.position1].filter(Boolean).join(" / ") || "상하수도사업부 / 부장"}
                  </p>
                  {front.position2 && (
                    <p className="text-[8.5px] text-slate-500 font-medium">{front.position2}</p>
                  )}
                </div>

                <div className="mt-3 space-y-0.5 text-[8.5px] leading-tight text-slate-600">
                  <p className="font-bold text-slate-900 text-[9.5px] mb-1">제일엔지니어링종합건축사사무소</p>
                  <p>{front.address || "06779 서울시 서초구 강남대로16길 22-6(양재동)"}</p>
                  <p>대표 : {front.telephone || "02-3498-2600"}  팩스 : {front.fax || "02-572-3112"}</p>
                  {front.directTelephone && <p>직통 : {front.directTelephone}</p>}
                  {front.mobile && <p>핸드폰: {front.mobile}</p>}
                  {front.email && <p>E-mail: {front.email}</p>}
                  <p className="font-bold text-slate-800 pt-0.5">{front.website || "www.cheileng.com"}</p>
                </div>
              </div>
            </div>

            {/* 명함 하단 풀 블레이드 스트라이프 바 (그린 15% + 딥블루 85%) */}
            <div className="flex h-3 w-full shrink-0">
              <div className="w-[16%] bg-[#55b936]" />
              <div className="w-[84%] bg-[#003876]" />
            </div>
          </div>
        ) : (
          /* 제일엔지니어링 뒷면 */
          <div
            style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
            className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between select-none"
          >
            <div className="p-5 flex-1 flex justify-between items-start">
              {/* 좌측: 로고 및 슬로건 */}
              <div className="h-full flex flex-col justify-between">
                <div>
                  <img
                    src="/logos/cheil_logo.png"
                    alt="CHEIL Logo"
                    className="h-9 object-contain"
                  />
                </div>
                <div className="text-[11px] font-bold italic tracking-tight text-slate-700 font-serif">
                  “Smiling Technology”
                </div>
              </div>

              {/* 우측: 영문 상세 내용 */}
              <div className="text-right flex flex-col justify-between h-full pt-1">
                <div>
                  <p className="text-[17px] font-bold text-slate-900">
                    {back.name || "Woo-Jin Jo"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-600 font-medium">
                    {[back.department, back.position1].filter(Boolean).join(" / ") || "영문부서 / 영문직책"}
                  </p>
                  {back.position2 && (
                    <p className="text-[8.5px] text-slate-500 font-medium">{back.position2}</p>
                  )}
                </div>

                <div className="mt-3 space-y-0.5 text-[8.5px] leading-tight text-slate-600">
                  <p className="font-bold text-slate-900 text-[9.5px] mb-1">CHEIL ENGINEERING CO., LTD.</p>
                  <p>{back.address1 || "22-6, Gangnamdaero 16gil, Seocho-gu,"}</p>
                  <p>{back.address2 || "Seoul, Korea (06779)"}</p>
                  <p>Tel: {back.telephone || "82-2-3498-2600"} Fax:{back.fax || "82-2-572-3112"}</p>
                  {back.directTelephone && <p>Dir: {back.directTelephone}</p>}
                  {back.mobile && <p>Mobile: {back.mobile}</p>}
                  {back.email && <p>E-mail: {back.email}</p>}
                  <p className="font-bold text-slate-800 pt-0.5">{back.website || "www.cheileng.com"}</p>
                </div>
              </div>
            </div>

            {/* 명함 하단 풀 블레이드 스트라이프 바 (그린 15% + 딥블루 85%) */}
            <div className="flex h-3 w-full shrink-0">
              <div className="w-[16%] bg-[#55b936]" />
              <div className="w-[84%] bg-[#003876]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
