import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, TriangleAlert, X } from "lucide-react";

export interface OrderStatusChangeRequest {
  actionLabel: string;
  orderIds: string[];
  currentStatus?: string;
  variant?: string;
  reason?: string;
  targetTab?: string | null;
  targetStatus?: string;
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
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    setReason("");
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
  const isReject = request.actionLabel === "주문 반려";
  const isDelete = request.actionLabel === "영구 삭제" || request.targetStatus === "DELETE";
  const orderCount = request.orderIds.length;

  const targetName = isDelete
    ? "영구 삭제"
    : request.targetTab || request.actionLabel;

  const confirmBtnText = isDelete
    ? `"${targetName}"(으)로 삭제하기`
    : `"${targetName}"(으)로 변경하기`;

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
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-all"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isDanger
                  ? "bg-red-50 text-red-500 dark:bg-red-950/40"
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
          <div className="rounded-lg border border-border bg-secondary/35 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">
                [주문번호]
              </p>
              <span className="text-xs font-semibold text-foreground">
                총 {orderCount}건 선택
              </span>
            </div>

            <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {request.orderIds.map((orderId) => (
                <span
                  key={orderId}
                  className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold text-foreground shadow-xs"
                >
                  {orderId}
                </span>
              ))}
            </div>
          </div>

          {isReject && (
            <div className="mt-4 space-y-1.5">
              <label htmlFor="reject-reason" className="text-xs font-medium text-foreground">
                반려 사유 입력 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="명함 오타, 이미지 화질 저하 등 반려 사유를 입력하세요."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          )}

          <div
            className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-4 ${
              isDanger
                ? "border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20"
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
                {isDelete
                  ? `선택하신 주문을 영구히 삭제하시겠습니까?`
                  : `선택하신 주문을 "${targetName}"(으)로 변경하시겠습니까?`}
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {isDelete
                  ? `삭제된 주문 내역은 복구할 수 없습니다.`
                  : request.currentStatus
                  ? `현재 "${request.currentStatus}" 탭에서 선택한 주문 ${orderCount}건의 상태를 변경 후 해당 탭으로 이동합니다.`
                  : `선택한 주문 ${orderCount}건의 상태를 변경합니다.`}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            취소하기
          </button>

          <button
            type="button"
            onClick={() => onConfirm?.({ ...request, reason: reason.trim() })}
            className={`h-10 rounded-md px-4 text-xs font-medium text-white transition ${
              isDanger
                ? "bg-red-500 hover:bg-red-600 shadow-xs"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
            }`}
          >
            {confirmBtnText}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
