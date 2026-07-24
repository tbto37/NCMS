import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Hash,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";

export interface OrderDetailData {
  id?: string;
  orderNumber?: string;
  department?: string;
  product?: string;
  material?: string;
  quantity?: number | string;
  memo?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  detailAddress?: string;
  status?: string;
  createdAt?: string;
}

interface OrderDetailModalProps {
  open: boolean;
  order: OrderDetailData | null;
  onClose: () => void;
}

function DetailItem({
                      label,
                      value,
                      fullWidth = false,
                    }: {
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 min-h-5 break-words text-xs font-medium text-foreground">
        {value === undefined || value === null || value === "" ? "-" : value}
      </dd>
    </div>
  );
}

function SectionTitle({
                        icon,
                        title,
                      }: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export default function OrderDetailModal({
                                           open,
                                           order,
                                           onClose,
                                         }: OrderDetailModalProps) {
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

  const orderNumber = order.orderNumber ?? order.id ?? "-";

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ReceiptText size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="order-detail-title"
                className="truncate text-base font-semibold text-foreground"
              >
                주문 상세
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                주문번호 {orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="주문 상세 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-secondary/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">주문번호</span>
              <strong className="font-mono text-sm font-semibold text-foreground">
                {orderNumber}
              </strong>
            </div>

            <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {order.status || "상태 미지정"}
            </span>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <SectionTitle
                icon={<Package size={14} />}
                title="주문 정보"
              />

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailItem label="부서명" value={order.department} />
                <DetailItem label="제품" value={order.product} />
                <DetailItem label="재질" value={order.material} />
                <DetailItem
                  label="수량"
                  value={
                    order.quantity === undefined || order.quantity === ""
                      ? undefined
                      : `${order.quantity}개`
                  }
                />
                <DetailItem
                  label="메모"
                  value={order.memo}
                  fullWidth
                />
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <SectionTitle
                icon={<UserRound size={14} />}
                title="주문자 정보"
              />

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailItem
                  label="이름"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={12} className="text-muted-foreground" />
                      {order.customerName || "-"}
                    </span>
                  }
                />

                <DetailItem
                  label="전화번호"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={12} className="text-muted-foreground" />
                      {order.phone || "-"}
                    </span>
                  }
                />

                <DetailItem
                  label="이메일"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={12} className="text-muted-foreground" />
                      {order.email || "-"}
                    </span>
                  }
                  fullWidth
                />
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <SectionTitle
                icon={<MapPin size={14} />}
                title="배송 정보"
              />

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailItem
                  label="기본주소"
                  value={order.address}
                  fullWidth
                />
                <DetailItem
                  label="상세주소"
                  value={order.detailAddress}
                  fullWidth
                />
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <SectionTitle
                icon={<CalendarDays size={14} />}
                title="처리 정보"
              />

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailItem label="주문상태" value={order.status} />
                <DetailItem label="접수일자" value={order.createdAt} />
              </dl>
            </section>
          </div>
        </main>

        <footer className="flex shrink-0 justify-end border-t border-border bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 min-w-24 rounded-md bg-primary px-5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            확인
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
