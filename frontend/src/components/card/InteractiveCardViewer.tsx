import React, { useState, useRef } from "react";
import { Minus, Plus, RotateCcw, Hand } from "lucide-react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import SvgBusinessCardPreview from "./SvgBusinessCardPreview";

interface InteractiveCardViewerProps {
  templateId?: number | string;
  cardData: BusinessCardInputData;
}

export default function InteractiveCardViewer({
  templateId,
  cardData,
}: InteractiveCardViewerProps) {
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1.0) return; // 확대 시에만 드래그 허용
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // 마우스 이동 (Pan)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  // 마우스 뗌/이탈
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // 줌 리셋
  const handleReset = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };

  // 슬라이더 변경
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScale(val);
    if (val <= 1.0) {
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 뷰포트 영역 (드래그 돋보기 뷰어) */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`relative h-[340px] w-full overflow-hidden rounded-xl border border-border bg-slate-200/50 select-none ${
          scale > 1.0 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
      >
        {/* 안내 뱃지 */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-xs">
          <Hand size={13} className="text-primary" />
          <span>{scale > 1.0 ? "마우스로 잡고 이동하며 구석구석 선명하게 점검하세요" : "슬라이더를 올려 확대한 뒤 마우스로 이동하세요"}</span>
        </div>

        {/* 한 세트 전체 줌/팬 컨테이너 (앞/뒷면 절대 겹치지 않음) */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="flex h-full w-full items-center justify-center p-4 transition-transform duration-75 ease-out"
        >
          <div className="grid w-full max-w-[1060px] grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-center text-xs font-semibold text-slate-700">앞면 (한글)</div>
              <SvgBusinessCardPreview templateId={templateId} cardData={cardData} isBack={false} scale={1.0} />
            </div>
            <div>
              <div className="mb-1.5 text-center text-xs font-semibold text-slate-700">뒷면 (영문)</div>
              <SvgBusinessCardPreview templateId={templateId} cardData={cardData} isBack={true} scale={1.0} />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 레거시 스타일 줌 컨트롤 패널 */}
      <div className="flex items-center justify-end gap-3 rounded-lg border border-border bg-card px-4 py-2 shadow-xs">
        <button
          type="button"
          onClick={() => setScale((prev) => Math.max(1.0, parseFloat((prev - 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-slate-600 transition hover:bg-secondary hover:text-foreground"
          title="축소"
        >
          <Minus size={14} />
        </button>

        {/* 슬라이더 바 */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1.0"
            max="2.2"
            step="0.05"
            value={scale}
            onChange={handleSliderChange}
            className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-slate-300 accent-primary focus:outline-hidden"
          />
          <span className="w-12 text-right text-xs font-semibold text-slate-800">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <button
          type="button"
          onClick={() => setScale((prev) => Math.min(2.2, parseFloat((prev + 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-slate-600 transition hover:bg-secondary hover:text-foreground"
          title="확대"
        >
          <Plus size={14} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="ml-2 flex h-7 items-center gap-1 rounded border border-border bg-background px-2 text-xs font-medium text-slate-600 transition hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw size={12} /> 리셋
        </button>
      </div>
    </div>
  );
}
