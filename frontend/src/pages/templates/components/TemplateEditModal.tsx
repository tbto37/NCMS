import { useState, useEffect } from "react";
import {
  ArrowRight,
  Building2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import type { FormEvent, ChangeEvent } from "react";

import type {
  BusinessCardInputData,
} from "@/shared/types/businessCard";
import DynamicBusinessCardPreview from "@/components/card/DynamicBusinessCardPreview";

interface TemplateEditModalProps {
  open: boolean;
  templateId?: number | string;
  onClose: () => void;
  onSave?: () => void;
  onNext?: (cardData: BusinessCardInputData) => void;
}

// 부서 매핑 테이블 (한글 -> 영문)
const DEPARTMENT_MAPPINGS: Record<string, string> = {
  "경영지원팀": "Management Support Team",
  "비즈니스개발실": "Business Development Division",
  "국내사업부": "Domestic Division",
  "하이테크사업부": "High-Tech Division",
  "글로벌사업부": "Global Division",
  "엔지니어링실": "Engineering Division",
  "도로사업부": "Highway Eng. Business Div.",
};

// 직급 매핑 테이블 (한글 -> 영문)
const POSITION_MAPPINGS: Record<string, string> = {
  "사장": "President",
  "부사장": "Senior Vice President",
  "전무": "Vice President",
  "이사": "Director",
  "시니어 매니저": "Senior Manager",
  "매니저": "Manager",
  "프로": "Professional",
  "국내사업부장": "Head of Domestic Division",
  "하이테크사업부장": "Head of High-Tech Division",
  "개발사업부장": "Head of Development Division",
  "글로벌사업부장": "Head of Global Division",
  "기술총괄": "Head of Engineering Division",
  "엔지니어링실장": "Division Leader",
  "실장": "Team Leader",
  "팀장": "Team Leader",
  "단장": "Project Manager",
};

const defaultCardData: BusinessCardInputData = {
  front: {
    name: "로그컴",
    departmentOption: "직접입력",
    department: "비즈니스개발실",
    position1Option: "직접입력",
    position1: "시니어 매니저",
    position2Option: "직접입력",
    position2: "",
    address: "06164 서울시 강남구 테헤란로 87길 36 도심공항타워",
    telephone: "+82 (0)70-0000-0000",
    fax: "",
    directTelephone: "",
    mobile: "+82 (0)10-0000-0000",
    email: "e@hanmiglobal.com",
    website: "www.hanmiglobal.com",
  },
  back: {
    name: "Brad Hong",
    department: "Business Development Division",
    position1: "Senior Manager",
    position2: "",
    address1: "City Air Tower Bldg., 36, Teheran-ro 87-gil,",
    address2: "Gangnam-gu, Seoul, 06164, Korea",
    telephone: "+82 (0)10-6379-1882",
    fax: "",
    directTelephone: "",
    mobile: "+82 (0)70-7188-2199",
    email: "baeksy@hanmiglobal.com",
    website: "www.hanmiglobal.com",
  },
};

export default function TemplateEditModal({
  open,
  templateId = "T_HANMI",
  onClose,
  onSave,
  onNext,
}: TemplateEditModalProps) {
  const [cardData, setCardData] = useState<BusinessCardInputData>(defaultCardData);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  useEffect(() => {
    // 템플릿에 따라 초기 렌더 데이터 조정 (실제 AI 원본 데이터 스펙)
    const tidStr = String(templateId || "").toLowerCase();
    if (tidStr.includes("cheil") || tidStr === "2") {
      setCardData({
        front: {
          name: "조우진",
          departmentOption: "직접입력",
          department: "상하수도사업부",
          position1Option: "직접입력",
          position1: "부장",
          position2Option: "직접입력",
          position2: "",
          address: "06779 서울시 서초구 강남대로16길 22-6(양재동)",
          telephone: "02-3498-2600",
          fax: "02-572-3112",
          directTelephone: "02-3498-2441",
          mobile: "010-9142-9719",
          email: "a5273586@hanmail.net",
          website: "www.cheileng.com",
        },
        back: {
          name: "Woo-Jin Jo",
          department: "Water Supply & Sewerage Eng. Div.",
          position1: "General Manager",
          position2: "",
          address1: "22-6, Gangnamdaero 16gil, Seocho-gu,",
          address2: "Seoul, Korea (06779)",
          telephone: "82-2-3498-2600",
          fax: "82-2-572-3112",
          directTelephone: "82-2-3498-2441",
          mobile: "82-10-9142-9719",
          email: "a5273586@hanmail.net",
          website: "www.cheileng.com",
        },
      });
    } else {
      setCardData(defaultCardData);
    }
  }, [templateId, open]);

  if (!open) return null;

  const isDeptDirect = !cardData.front.departmentOption || cardData.front.departmentOption === "직접입력";
  const isPos1Direct = !cardData.front.position1Option || cardData.front.position1Option === "직접입력";
  const isPos2Direct = !cardData.front.position2Option || cardData.front.position2Option === "직접입력";

  // 앞면 일반 필드 변경 시 실시간 반영
  const handleFrontChange = (field: string, value: string) => {
    setCardData((prev) => {
      const nextFront = { ...prev.front, [field]: value };
      const nextBack = { ...prev.back };

      // 웹사이트 동기화
      if (field === "website") {
        nextBack.website = value;
      }
      return { front: nextFront, back: nextBack };
    });
  };

  // 뒷면 일반 필드 변경 시 실시간 반영
  const handleBackChange = (field: string, value: string) => {
    setCardData((prev) => ({
      ...prev,
      back: { ...prev.back, [field]: value },
    }));
  };

  // 부서 셀렉트 변경 시 레거시 동일 한/영 동시 매핑
  const handleDeptSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKor = e.target.value;
    const mappedEng = DEPARTMENT_MAPPINGS[selectedKor] || "";

    setCardData((prev) => ({
      front: {
        ...prev.front,
        departmentOption: selectedKor,
        department: selectedKor === "직접입력" ? prev.front.department : selectedKor,
      },
      back: {
        ...prev.back,
        department: selectedKor === "직접입력" ? prev.back.department : mappedEng,
      },
    }));
  };

  // 직급1 셀렉트 변경 시 레거시 동일 한/영 동시 매핑
  const handlePosition1SelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKor = e.target.value;
    const mappedEng = POSITION_MAPPINGS[selectedKor] || "";

    setCardData((prev) => ({
      front: {
        ...prev.front,
        position1Option: selectedKor,
        position1: selectedKor === "직접입력" ? prev.front.position1 : selectedKor,
      },
      back: {
        ...prev.back,
        position1: selectedKor === "직접입력" ? prev.back.position1 : mappedEng,
      },
    }));
  };

  // 직급2 셀렉트 변경 시 레거시 동일 한/영 동시 매핑
  const handlePosition2SelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKor = e.target.value;
    const mappedEng = POSITION_MAPPINGS[selectedKor] || "";

    setCardData((prev) => ({
      front: {
        ...prev.front,
        position2Option: selectedKor,
        position2: selectedKor === "직접입력" ? prev.front.position2 : selectedKor,
      },
      back: {
        ...prev.back,
        position2: selectedKor === "직접입력" ? prev.back.position2 : mappedEng,
      },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNext?.(cardData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
        className="flex h-[calc(100vh-32px)] w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">명함 템플릿 편집</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">하단 필드를 수정하면 미리보기 화면에 즉시 적용됩니다.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* 미리보기 세션 */}
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">실시간 명함 미리보기</h3>
                  <p className="mt-1 text-xs text-muted-foreground">입력하시는 텍스트가 미리보기에 실시간으로 렌더링됩니다.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale((prev) => Math.max(0.7, prev - 0.1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-medium">{Math.round(zoomScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((prev) => Math.min(1.4, prev + 0.1))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1.0)}
                    className="ml-1 flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw size={13} /> 초기화
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold">앞면 (한글)</span>
                    <span className="text-[11px] text-muted-foreground">Korean</span>
                  </div>
                  <DynamicBusinessCardPreview
                    templateId={templateId}
                    cardData={cardData}
                    isBack={false}
                    scale={zoomScale}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold">뒷면 (영문)</span>
                    <span className="text-[11px] text-muted-foreground">English</span>
                  </div>
                  <DynamicBusinessCardPreview
                    templateId={templateId}
                    cardData={cardData}
                    isBack={true}
                    scale={zoomScale}
                  />
                </div>
              </div>
            </section>

            {/* 입력 폼 섹션 */}
            <div className="grid items-start gap-5 xl:grid-cols-2">
              {/* 앞면 입력 폼 */}
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">앞면 정보</h3>
                  <p className="mt-1 text-xs text-muted-foreground">한글 명함에 표시할 정보를 입력합니다.</p>
                </div>
                <div className="space-y-3 px-5 py-5">
                  {/* 1. 이름 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">이름</label>
                    <input
                      value={cardData.front.name}
                      onChange={(e) => handleFrontChange("name", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 2. 부서 선택 & 부서 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">부서 선택</label>
                    <select
                      value={cardData.front.departmentOption || "직접입력"}
                      onChange={handleDeptSelectChange}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    >
                      <option value="직접입력">직접입력</option>
                      {Object.keys(DEPARTMENT_MAPPINGS).map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <div />
                    <input
                      value={cardData.front.department}
                      onChange={(e) => handleFrontChange("department", e.target.value)}
                      readOnly={!isDeptDirect}
                      className={`h-9 w-full rounded-md border border-border px-3 text-xs outline-none transition ${isDeptDirect
                        ? "bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/15"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        }`}
                    />
                  </div>

                  {/* 3. 직급1 선택 & 직급1 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직급1 선택</label>
                    <select
                      value={cardData.front.position1Option || "직접입력"}
                      onChange={handlePosition1SelectChange}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    >
                      <option value="직접입력">직접입력</option>
                      {Object.keys(POSITION_MAPPINGS).map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <div />
                    <input
                      value={cardData.front.position1}
                      onChange={(e) => handleFrontChange("position1", e.target.value)}
                      readOnly={!isPos1Direct}
                      className={`h-9 w-full rounded-md border border-border px-3 text-xs outline-none transition ${isPos1Direct
                        ? "bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/15"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        }`}
                    />
                  </div>

                  {/* 4. 직급2 선택 & 직급2 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직급2 선택</label>
                    <select
                      value={cardData.front.position2Option || "직접입력"}
                      onChange={handlePosition2SelectChange}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    >
                      <option value="직접입력">직접입력</option>
                      {Object.keys(POSITION_MAPPINGS).map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <div />
                    <input
                      value={cardData.front.position2}
                      onChange={(e) => handleFrontChange("position2", e.target.value)}
                      readOnly={!isPos2Direct}
                      className={`h-9 w-full rounded-md border border-border px-3 text-xs outline-none transition ${isPos2Direct
                        ? "bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/15"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        }`}
                    />
                  </div>

                  {/* 5. 주소 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">주소</label>
                    <input
                      value={cardData.front.address}
                      onChange={(e) => handleFrontChange("address", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 6. 전화번호 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">전화번호</label>
                    <input
                      value={cardData.front.telephone}
                      onChange={(e) => handleFrontChange("telephone", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 7. 팩스 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">팩스</label>
                    <input
                      value={cardData.front.fax}
                      onChange={(e) => handleFrontChange("fax", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 8. 직통번호 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직통번호</label>
                    <input
                      value={cardData.front.directTelephone}
                      onChange={(e) => handleFrontChange("directTelephone", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 9. 핸드폰 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">핸드폰</label>
                    <input
                      value={cardData.front.mobile}
                      onChange={(e) => handleFrontChange("mobile", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 10. 이메일 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">이메일</label>
                    <input
                      value={cardData.front.email}
                      onChange={(e) => handleFrontChange("email", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 11. 웹사이트 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">웹사이트</label>
                    <input
                      value={cardData.front.website}
                      onChange={(e) => handleFrontChange("website", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>
                </div>
              </section>

              {/* 뒷면 입력 폼 (모든 필드 일반 input) */}
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">뒷면 정보</h3>
                  <p className="mt-1 text-xs text-muted-foreground">영문 명함에 표시할 정보를 입력합니다.</p>
                </div>
                <div className="space-y-3 px-5 py-5">
                  {/* 1. 이름 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">이름</label>
                    <input
                      value={cardData.back.name}
                      onChange={(e) => handleBackChange("name", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 2. 부서 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">부서</label>
                    <input
                      value={cardData.back.department}
                      onChange={(e) => handleBackChange("department", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 3. 직급1 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직급1</label>
                    <input
                      value={cardData.back.position1}
                      onChange={(e) => handleBackChange("position1", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 4. 직급2 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직급2</label>
                    <input
                      value={cardData.back.position2}
                      onChange={(e) => handleBackChange("position2", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 5. 주소 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">주소</label>
                    <input
                      value={cardData.back.address1}
                      onChange={(e) => handleBackChange("address1", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 6. 주소2 (영문) */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">주소2</label>
                    <input
                      value={cardData.back.address2}
                      onChange={(e) => handleBackChange("address2", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 7. 전화번호 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">전화번호</label>
                    <input
                      value={cardData.back.telephone}
                      onChange={(e) => handleBackChange("telephone", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 8. 팩스 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">팩스</label>
                    <input
                      value={cardData.back.fax}
                      onChange={(e) => handleBackChange("fax", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 9. 직통번호 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">직통번호</label>
                    <input
                      value={cardData.back.directTelephone}
                      onChange={(e) => handleBackChange("directTelephone", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 10. 핸드폰 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">핸드폰</label>
                    <input
                      value={cardData.back.mobile}
                      onChange={(e) => handleBackChange("mobile", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 11. 이메일 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">이메일</label>
                    <input
                      value={cardData.back.email}
                      onChange={(e) => handleBackChange("email", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>

                  {/* 12. 웹사이트 */}
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">웹사이트</label>
                    <input
                      value={cardData.back.website}
                      onChange={(e) => handleBackChange("website", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <footer className="flex shrink-0 items-center justify-between border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            취소
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              다음 <ArrowRight size={14} />
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
