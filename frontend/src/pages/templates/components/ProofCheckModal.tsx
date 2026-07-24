import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

interface ProofCheckModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onConfirm?: () => void;
}

const checklistItems = [
  {
    id: "typo",
    label: "오탈자는 없는지 확인하셨습니까?",
  },
  {
    id: "contact",
    label: "연락처 정보(웹사이트, 이메일 등)를 입력하셨습니까?",
  },
  {
    id: "design",
    label: "명함 디자인은 모두 확인하셨습니까?",
  },
];

export default function ProofCheckModal({
                                          open,
                                          onClose,
                                          onBack,
                                          onConfirm,
                                        }: ProofCheckModalProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const allChecked = useMemo(
    () => checkedItems.length === checklistItems.length,
    [checkedItems],
  );

  if (!open) return null;

  const toggleItem = (id: string) => {
    setCheckedItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    setCheckedItems(allChecked ? [] : checklistItems.map((item) => item.id));
  };

  const handleClose = () => {
    setCheckedItems([]);
    onClose();
  };

  const handleBack = () => {
    setCheckedItems([]);
    onBack?.();
  };

  const handleConfirm = () => {
    if (!allChecked) return;
    onConfirm?.();
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex h-dvh w-full items-center justify-center overflow-hidden bg-black/55 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-check-title"
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-primary" />
            <h2
              id="proof-check-title"
              className="text-sm font-semibold text-foreground"
            >
              교정 확인
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="교정 확인 창 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={17} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-7">
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground">
              다음 사항을 꼭 확인해 주세요!
            </h3>

            <p className="mx-auto mt-2 max-w-[480px] text-xs leading-5 text-muted-foreground">
              오타로 인한 하자 또는 불량은 고객님 과실로 AS가 불가합니다.
              주문 전 꼼꼼하게 확인해 주세요.
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/45 px-4 py-3 transition hover:bg-secondary/70">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
              />

              <span className="text-xs font-semibold text-foreground">
                모두 확인하였습니다.
              </span>
            </label>

            <div className="mt-4 space-y-1">
              {checklistItems.map((item) => {
                const checked = checkedItems.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5 transition hover:bg-secondary/45"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
                    />

                    <span className="text-xs leading-5 text-foreground">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-border bg-card px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={handleBack}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            다시 확인하기
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!allChecked}
            className="h-10 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
          >
            확인 완료
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
