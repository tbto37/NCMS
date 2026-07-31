import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface RejectReasonModalProps {
  open: boolean;
  orderNo?: string;
  customerName?: string;
  reason?: string;
  onClose: () => void;
}

export default function RejectReasonModal({
  open,
  orderNo,
  customerName,
  reason,
  onClose,
}: RejectReasonModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-reason-title"
        className="w-full max-w-[460px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle size={15} />
            </span>
            <div>
              <h3 id="reject-reason-title" className="text-sm font-semibold text-foreground">
                주문 승인반려 사유
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={16} />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/35 px-4 py-2.5 text-xs">
            <div className="space-x-1.5">
              <span className="text-muted-foreground">주문번호</span>
              <strong className="font-mono font-semibold text-foreground">
                {orderNo || "-"}
              </strong>
            </div>
            {customerName && (
              <div className="space-x-1.5">
                <span className="text-muted-foreground">주문자</span>
                <span className="font-medium text-foreground">{customerName}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-destructive">
              반려 사유 내용
            </label>
            <div className="min-h-[100px] w-full rounded-lg border border-red-200 bg-red-50/60 p-3.5 text-xs leading-relaxed text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 whitespace-pre-wrap break-words">
              {reason && reason.trim() ? reason : "입력된 반려 사유가 없습니다."}
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t border-border bg-card px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 min-w-20 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            확인
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
