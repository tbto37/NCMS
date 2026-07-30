import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Truck, X } from "lucide-react";

export interface ShipmentTrackingOrder {
  id: number | string;
  name: string;
  site: string;
  shippingMethod?: string;
  trackingNumber?: string;
}

export interface ShipmentTrackingSubmitPayload {
  orderId: number | string;
  shippingMethod: string;
  trackingNumber: string;
}

interface ShipmentTrackingModalProps {
  open: boolean;
  order: ShipmentTrackingOrder | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (payload: ShipmentTrackingSubmitPayload) => void;
}

const SHIPPING_METHOD_OPTIONS = [
  "택배",
  "CJ대한통운",
  "한진택배",
  "롯데택배",
  "우체국택배",
];

export default function ShipmentTrackingModal({
  open,
  order,
  submitting = false,
  onClose,
  onConfirm,
}: ShipmentTrackingModalProps) {
  const [shippingMethod, setShippingMethod] = useState("택배");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (!open || !order) return;

    setShippingMethod(order.shippingMethod || "택배");
    setTrackingNumber(order.trackingNumber || "");
  }, [open, order]);

  useEffect(() => {
    if (!open) return;

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

  if (!open || !order) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!order) return;

    onConfirm({
      orderId: order.id,
      shippingMethod,
      trackingNumber: trackingNumber.trim(),
    });
  }

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-tracking-title"
        className="relative w-full max-w-[500px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-all"
      >
        {submitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-2xl">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  배송 정보 저장 중...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  운송장 번호를 등록하고 상태를 발송완료로 변경합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="shipment-tracking-title"
                className="truncate text-base font-semibold text-foreground"
              >
                배송 정보 입력
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                운송장 번호를 등록하고 발송 처리를 완료합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="배송 정보 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-6">
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono text-foreground">{order.id}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span>주문 정보</span>
              <span className="text-foreground font-medium">
                {order.site} / {order.name}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="shipping-method" className="text-xs font-medium text-foreground">
                배송 방법 / 택배사
              </label>
              <select
                id="shipping-method"
                disabled={submitting}
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              >
                {SHIPPING_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tracking-number" className="text-xs font-medium text-foreground">
                운송장 번호
              </label>
              <input
                id="tracking-number"
                type="text"
                disabled={submitting}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="운송장 번호를 입력하세요"
                className="w-full rounded-md border border-input bg-background p-2.5 font-mono text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
            </div>
          </div>

          <footer className="mt-6 flex shrink-0 items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow-xs transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                "발송 완료 처리"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
