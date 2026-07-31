import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  HelpCircle,
  Info,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

interface UserGuideModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground text-xs">
        {icon}
      </span>
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export default function UserGuideModal({
  open,
  onClose,
  onOpenChange,
}: UserGuideModalProps) {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-guide-title"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[680px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        {/* Modal Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen size={18} />
            </span>

            <div className="min-w-0">
              <h2
                id="user-guide-title"
                className="truncate text-base font-semibold text-foreground"
              >
                이용가이드
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                제일엔지니어링 명함 주문 시스템 이용 안내
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="모달 닫기"
          >
            <X size={18} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-foreground bg-background">
          {/* Intro Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
              <Info size={14} />
            </span>
            <p className="leading-relaxed font-medium">
              본 시스템은 사용자가 개인정보를 입력하는 것만으로 BI 규약에 따라 인쇄물을 주문할 수 있는 솔루션입니다.
            </p>
          </div>

          {/* Process Steps */}
          <div>
            <SectionTitle
              icon={<Layers size={13} />}
              title="주문 절차 안내"
            />

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    1
                  </span>
                  템플릿 선택
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
                  <img
                    src="/user_guide_1.jpg"
                    alt="1. 템플릿 선택 안내"
                    className="w-full h-auto object-contain max-h-[360px]"
                    loading="lazy"
                  />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  좌측메뉴의 템플릿을 클릭 후 부서에 적합한 템플릿을 선택합니다.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    2
                  </span>
                  템플릿 편집
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
                  <img
                    src="/user_guide_2.jpg"
                    alt="2. 템플릿 편집 안내"
                    className="w-full h-auto object-contain max-h-[360px]"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <div>
                    <p className="font-medium text-foreground">a. 하단 폼박스에 정보를 입력합니다.</p>
                    <div className="mt-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                      ※ 회사내규에 정의된 직급, 부서, 주소등은 셀렉트박스에서 선택하는 것만으로 한글, 영문 정보가 자동입력됩니다.
                      원하는 정보가 없거나 맞지 않는경우 "직접입력"을 선택하여 해당정보를 입력합니다.
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">b. "적용하기" 버튼을 누르고 잠시 기다리시면 입력된 정보로 프리뷰 이미지가 생성됩니다.</p>
                    <div className="mt-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                      ※ 정보를 변경하시면 꼭 "적용하기" 버튼을 눌러주셔야 합니다.
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">c. 정보입력이 완료되면 "다음" 버튼을 누르신후 교정페이지로 이동합니다.</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    3
                  </span>
                  교정 승인
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
                  <img
                    src="/user_guide_3.jpg"
                    alt="3. 교정 승인 안내"
                    className="w-full h-auto object-contain max-h-[360px]"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground">a. 전체선택 체크박스를 클릭하시면 "다음" 버튼이 활성화됩니다.</p>
                  <div>
                    <p className="font-medium text-foreground">b. "다음" 버튼을 누르시면 자동으로 인쇄용 파일이 서버에 생성됩니다.</p>
                    <div className="mt-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                      ※ 인쇄용 파일은 클라우드에 저장되어 있지만 관리자의 승인이 없으면 주문을 할 수 없습니다.
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    4
                  </span>
                  주문서 작성
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
                  <img
                    src="/user_guide_4.jpg"
                    alt="4. 주문서 작성 안내"
                    className="w-full h-auto object-contain max-h-[360px]"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground">a. 접속 ID별(부서별)로 배송정보가 자동으로 입력됩니다. 정보변경을 원할시에만 직접 변경해주시면됩니다.</p>
                  <div>
                    <p className="font-medium text-foreground">b. 전달메모와 주문수량 선택후 "주문하기"를 누르면 모든절차가 마무리됩니다.</p>
                    <div className="mt-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                      ※ 모든주문은 관리자의 승인 후 진행됩니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <SectionTitle
              icon={<HelpCircle size={13} />}
              title="FAQ (자주 묻는 질문)"
            />

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <p className="font-semibold text-foreground">
                  <span className="text-primary font-bold mr-1.5">Q.</span> 주문완료 후 승인이 반려되었습니다.
                </p>
                <p className="text-muted-foreground pl-5 leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">A.</span> 회사내규에 맞는 정보로 다시 접수하시면 됩니다.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <p className="font-semibold text-foreground">
                  <span className="text-primary font-bold mr-1.5">Q.</span> 재주문은 어떻게 하나요?
                </p>
                <p className="text-muted-foreground pl-5 leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">A.</span> 주문리스트에서 주문일시와 이름을 검색합니다. 주문이력이 나타나면 문서위의 화살표 아이콘을 클릭하면 재주문이 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div>
            <SectionTitle
              icon={<Sparkles size={13} />}
              title="참고하시기 바랍니다"
            />

            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <p className="font-semibold text-foreground">1. 주문리스트 액션 팁</p>
              <ul className="text-muted-foreground space-y-1.5 pl-4 list-disc leading-relaxed">
                <li><strong className="text-foreground font-semibold">프리뷰 액션 :</strong> 어떤 인쇄물을 만들었는지 확인용입니다.</li>
                <li><strong className="text-foreground font-semibold">재주문 액션 :</strong> 같은 내용으로 재주문하려면 재작업 액션버튼을 통해 빠른 작업이 가능합니다.</li>
                <li><strong className="text-foreground font-semibold">프리뷰를 보다가 오타 등과 같은 오류를 발견하시면 관리자 승인요청 전에 하단 "취소"버튼을 통해 캔슬이 가능합니다.</strong></li>
              </ul>
              <div className="mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                ※ 접수번호 맨앞에 있는 박스에 체크 후 "취소" 버튼을 클릭.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="flex h-14 shrink-0 items-center justify-end border-t border-border bg-card px-5 sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            닫기
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
