import React from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";

interface DynamicBusinessCardPreviewProps {
  templateId?: string;
  cardData: BusinessCardInputData;
  isBack?: boolean;
  scale?: number;
}

export default function DynamicBusinessCardPreview({
  templateId = "T_HANMI",
  cardData,
  isBack = false,
  scale = 1.0,
}: DynamicBusinessCardPreviewProps) {
  const front = cardData.front || {};
  const back = cardData.back || {};

  const isHanmi = templateId?.includes("HANMI") || templateId?.includes("hanmi");
  const isCheil = templateId?.includes("CHEIL") || templateId?.includes("cheil");

  // scale 조절용 랩핑 style
  const containerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  };

  if (isHanmi) {
    return (
      <div className="flex min-h-[210px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-4 overflow-hidden">
        <div style={containerStyle} className="transition-transform duration-150 ease-out">
          {!isBack ? (
            /* 한미글로벌 앞면 (한글) */
            <div className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 p-6 flex flex-col justify-between select-none text-slate-800 font-sans">
              {/* 상단: 로고 & 이름/직급 */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded bg-[#004B96] text-white font-black text-lg tracking-tighter shadow-sm">
                    HG
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-medium text-slate-500 tracking-tight">글로벌 프리콘 전문가</span>
                    <span className="text-[15px] font-black text-[#004B96] tracking-tighter">한미글로벌</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[17px] font-extrabold text-slate-900 tracking-tight">
                    {front.name || "투 비 더 원"}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">
                    {front.position1 || "시니어 매니저"} {front.department ? `/ ${front.department}` : ""}
                  </div>
                </div>
              </div>

              {/* 하단: 회사명 및 상세 연락처 */}
              <div className="mt-2 text-left space-y-1.5">
                <div className="text-[11px] font-bold text-slate-900">한미글로벌 주식회사</div>
                <div className="space-y-0.5 text-[9.5px] leading-tight text-slate-600 font-medium">
                  {front.telephone && <div><span className="font-bold text-slate-700">T</span> {front.telephone}</div>}
                  {front.mobile && <div><span className="font-bold text-slate-700">M</span> {front.mobile}</div>}
                  {front.email && <div><span className="font-bold text-slate-700">E</span> {front.email}</div>}
                  <div className="pt-1 text-[9px] text-slate-500">{front.address || "06164, 서울시 강남구 테헤란로 87길 36 도심공항타워"}</div>
                </div>
              </div>
            </div>
          ) : (
            /* 한미글로벌 뒷면 (영문) */
            <div className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 p-6 flex flex-col justify-between select-none text-slate-800 font-sans">
              {/* 상단: 영문 로고 & 영문 이름 */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded bg-[#004B96] text-white font-black text-lg tracking-tighter shadow-sm">
                    HG
                  </div>
                  <span className="text-[16px] font-bold text-[#004B96] tracking-tight">HanmiGlobal</span>
                </div>

                <div className="text-right">
                  <div className="text-[17px] font-extrabold text-slate-900 tracking-tight">
                    {back.name || "Brad Hong"}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">
                    {back.position1 || "Senior Manager"} {back.department ? `/ ${back.department}` : ""}
                  </div>
                </div>
              </div>

              {/* 하단: 영문 회사명 & 주소 */}
              <div className="mt-2 text-left space-y-1">
                <div className="text-[11px] font-bold text-slate-900">HanmiGlobal Co.,Ltd.</div>
                <div className="text-[9.5px] font-medium text-[#004B96]">{back.website || "www.hanmiglobal.com"}</div>
                <div className="text-[9px] leading-tight text-slate-500 font-medium max-w-[280px]">
                  {back.address1 || "City Air Tower Bldg., 36, Teheran-ro 87-gil, Gangnam-gu, Seoul, 06164, Korea"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 제일엔지니어링 디자인
  return (
    <div className="flex min-h-[210px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-4 overflow-hidden">
      <div style={containerStyle} className="transition-transform duration-150 ease-out">
        {!isBack ? (
          /* 제일엔지니어링 앞면 */
          <div className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between select-none">
            <div className="grid h-[calc(100%-8px)] grid-cols-[34%_66%]">
              <div className="flex flex-col justify-between border-r border-slate-200 px-4 py-5">
                <div className="flex items-end gap-1">
                  <span className="text-[26px] font-black tracking-[-0.08em] text-[#06418f]">CHEIL</span>
                  <span className="mb-1 h-4 w-1.5 bg-[#55b936]" />
                </div>
                <span className="text-[7.5px] italic font-semibold text-slate-600">“Smiling Technology”</span>
              </div>

              <div className="px-4 py-4 flex flex-col justify-between">
                <div>
                  <p className="text-[14px] font-bold text-slate-900">{front.name || "홍 길 동"}</p>
                  <p className="mt-0.5 text-[8px] text-slate-500 font-medium">
                    {[front.department, front.position1, front.position2].filter(Boolean).join(" / ") || "도로사업부 / 이사"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[7.5px] font-bold text-slate-700">(주)제일엔지니어링 종합건축사사무소</p>
                  <div className="space-y-0.5 text-[7px] leading-tight text-slate-500">
                    <p>{front.address || "06779 서울시 서초구 방배천로 22-6"}</p>
                    <p>TEL. {front.telephone || "02-3498-2600"} / FAX. {front.fax || "02-572-8970"}</p>
                    {front.mobile && <p>MOBILE. {front.mobile}</p>}
                    {front.email && <p>{front.email}</p>}
                    <p>{front.website || "www.cheileng.com"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-2">
              <div className="w-[12%] bg-[#55b936]" />
              <div className="flex-1 bg-[#06418f]" />
            </div>
          </div>
        ) : (
          /* 제일엔지니어링 뒷면 */
          <div className="relative w-[430px] h-[240px] bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between select-none">
            <div className="grid h-[calc(100%-8px)] grid-cols-[34%_66%]">
              <div className="flex flex-col justify-between border-r border-slate-200 px-4 py-5">
                <div className="flex items-end gap-1">
                  <span className="text-[26px] font-black tracking-[-0.08em] text-[#06418f]">CHEIL</span>
                  <span className="mb-1 h-4 w-1.5 bg-[#55b936]" />
                </div>
                <span className="text-[7.5px] italic font-semibold text-slate-600">“Smiling Technology”</span>
              </div>

              <div className="px-4 py-4 flex flex-col justify-between">
                <div>
                  <p className="text-[14px] font-bold text-slate-900">{back.name || "Hong Gil Dong"}</p>
                  <p className="mt-0.5 text-[8px] text-slate-500 font-medium">
                    {[back.department, back.position1, back.position2].filter(Boolean).join(" / ") || "Highway Eng. Business Div. / Director"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[7.5px] font-bold text-slate-700">CHEIL ENGINEERING CO., LTD.</p>
                  <div className="space-y-0.5 text-[7px] leading-tight text-slate-500">
                    <p>{back.address1 || "22-6, Bangbaemae-ro 16gil, Seocho-gu,"}</p>
                    <p>{back.address2 || "Seoul, Korea (06779)"}</p>
                    <p>TEL. {back.telephone || "82-2-3498-2600"}</p>
                    {back.mobile && <p>MOBILE. {back.mobile}</p>}
                    {back.email && <p>{back.email}</p>}
                    <p>{back.website || "www.cheileng.com"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-2">
              <div className="w-[12%] bg-[#55b936]" />
              <div className="flex-1 bg-[#06418f]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
