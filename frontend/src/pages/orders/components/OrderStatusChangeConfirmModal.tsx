import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, RefreshCw, TriangleAlert, X } from "lucide-react";

export interface OrderStatusChangeRequest {
  actionLabel: string;
  orderIds: string[];
  targetOrders?: Array<{ id: string; name: string }>;
  currentStatus?: string;
  variant?: string;
  reason?: string;
  targetTab?: string | null;
  targetStatus?: string;
}

interface OrderStatusChangeConfirmModalProps {
  open: boolean;
  request: OrderStatusChangeRequest | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm?: (request: OrderStatusChangeRequest) => void;
}

export default function OrderStatusChangeConfirmModal({
  open,
  request,
  submitting = false,
  onClose,
  onConfirm,
}: OrderStatusChangeConfirmModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    setReason("");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open || !request) return null;

  const isDanger = request.variant === "danger";
  const isReject = request.actionLabel === "주문 반려" || request.targetStatus === "REJECTED";
  const isDelete = request.actionLabel === "영구 삭제" || request.targetStatus === "DELETE";
  const orderCount = request.orderIds.length;

  const targetName = isDelete
    ? "영구 삭제"
    : request.targetTab || request.actionLabel;

  const confirmBtnText = isDelete
    ? `"${targetName}"(으)로 삭제하기`
    : `"${targetName}"(으)로 승인/변경하기`;

  const isSubmitDisabled = submitting || (isReject && !reason.trim());

  // 주문 대상자 이름 문자열 가공
  const displayTargets = request.targetOrders || request.orderIds.map((id) => ({ id, name: "" }));

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="order-status-change-title"
        aria-describedby="order-status-change-description"
        className="relative w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-all"
      >
        {/* 작업 중 Dim 로딩 오버레이 */}
        {submitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-2xl">
              <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {isDelete ? "주문 삭제 처리 중..." : "주문 상태 변경 중..."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  데이터베이스에 반영하고 있습니다. 완료될 때까지 잠시만 기다려 주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isDanger
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-950/40"
              }`}
            >
              <RefreshCw size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="order-status-change-title"
                className="truncate text-base font-semibold text-foreground"
              >
                주문 승인 및 상태 변경
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                선택한 주문의 처리 상태를 변경합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="주문 상태 변경 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-6">
          <div className="rounded-lg border border-border bg-secondary/35 px-4 py-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <p className="text-xs font-semibold text-foreground">
                승인 / 변경 대상 정보
              </p>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                총 {orderCount}건 선택
              </span>
            </div>

            <div className="mt-2.5 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
              {displayTargets.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs shadow-xs"
                >
                  {item.name ? (
                    <strong className="font-semibold text-foreground">{item.name}</strong>
                  ) : null}
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({item.id})
                  </span>
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
                disabled={submitting}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="명함 오타, 이미지 화질 저하 등 반려 사유를 입력하세요."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
            </div>
          )}

          <div
            className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-4 ${
              isDanger
                ? "border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20"
                : "border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20"
            }`}
          >
            <TriangleAlert
              size={18}
              className={`mt-0.5 shrink-0 ${isDanger ? "text-red-600" : "text-blue-600"}`}
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
            disabled={submitting}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            취소하기
          </button>

          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={() => onConfirm?.({ ...request, reason: reason.trim() })}
            className={`flex h-10 items-center justify-center gap-2 rounded-md px-5 text-xs font-semibold text-white transition disabled:opacity-60 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 shadow-xs"
                : "bg-blue-600 hover:bg-blue-700 shadow-xs"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              confirmBtnText
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
