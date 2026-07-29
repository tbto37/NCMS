import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Truck, X } from "lucide-react";

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
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !order) return null;

  const isValid = trackingNumber.trim().length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-tracking-title"
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
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
                송장번호 입력
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                배송정보를 등록하고 주문 상태를 발송완료로 변경합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="송장번호 입력 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-6">
          <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <p className="text-[11px] font-medium text-muted-foreground">주문 정보</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{order.id}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.name} · {order.site}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-2 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
              <label htmlFor="shipping-method" className="text-xs font-medium text-foreground">
                배송방법
              </label>
              <select
                id="shipping-method"
                value={shippingMethod}
                onChange={(event) => setShippingMethod(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                {SHIPPING_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
              <label htmlFor="tracking-number" className="text-xs font-medium text-foreground">
                송장번호
              </label>
              <input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="송장번호를 입력하세요"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            취소하기
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={() =>
              onConfirm({
                orderId: order.id,
                shippingMethod,
                trackingNumber: trackingNumber.trim(),
              })
            }
            className="h-10 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            발송완료로 변경하기
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
