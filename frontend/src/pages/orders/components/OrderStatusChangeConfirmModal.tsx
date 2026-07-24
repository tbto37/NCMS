import { useEffect } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, TriangleAlert, X } from "lucide-react";

export interface OrderStatusChangeRequest {
  actionLabel: string;
  orderIds: string[];
  currentStatus?: string;
  variant?: string;
}

interface OrderStatusChangeConfirmModalProps {
  open: boolean;
  request: OrderStatusChangeRequest | null;
  onClose: () => void;
  onConfirm?: (request: OrderStatusChangeRequest) => void;
}

export default function OrderStatusChangeConfirmModal({
                                                        open,
                                                        request,
                                                        onClose,
                                                        onConfirm,
                                                      }: OrderStatusChangeConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !request) return null;

  const isDanger = request.variant === "danger";
  const orderCount = request.orderIds.length;

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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="order-status-change-title"
        aria-describedby="order-status-change-description"
        className="w-full max-w-[540px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isDanger
                  ? "bg-red-50 text-red-500"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <RefreshCw size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="order-status-change-title"
                className="truncate text-base font-semibold text-foreground"
              >
                주문 상태 변경
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                선택한 주문의 처리 상태를 변경합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="주문 상태 변경 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              선택된 주문
            </p>

            <p className="mt-1 text-lg font-semibold text-foreground">
              {orderCount}건
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-secondary/35 px-4 py-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              주문번호
            </p>

            <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {request.orderIds.map((orderId) => (
                <span
                  key={orderId}
                  className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs font-medium text-foreground"
                >
                  {orderId}
                </span>
              ))}
            </div>
          </div>

          <div
            className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-4 ${
              isDanger
                ? "border-red-200 bg-red-50/70"
                : "border-border bg-card"
            }`}
          >
            <TriangleAlert
              size={18}
              className={`mt-0.5 shrink-0 ${
                isDanger ? "text-red-500" : "text-accent"
              }`}
            />

            <div>
              <p
                id="order-status-change-description"
                className="text-sm font-semibold text-foreground"
              >
                “{request.actionLabel}” 상태로 변경하시겠습니까?
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {request.currentStatus
                  ? `현재 “${request.currentStatus}” 탭에서 선택한 주문 ${orderCount}건을 변경합니다.`
                  : `선택한 주문 ${orderCount}건의 상태를 변경합니다.`}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() => onConfirm?.(request)}
            className={`h-10 rounded-md px-4 text-xs font-medium text-white transition ${
              isDanger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            “{request.actionLabel}”(으)로 변경
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
