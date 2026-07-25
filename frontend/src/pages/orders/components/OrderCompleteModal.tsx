import { createPortal } from "react-dom";
import { CheckCircle2, ClipboardList, LayoutGrid } from "lucide-react";

interface OrderCompleteModalProps {
  open: boolean;
  onGoMain: () => void;
  onGoOrders: () => void;
}

export default function OrderCompleteModal({
                                             open,
                                             onGoMain,
                                             onGoOrders,
                                           }: OrderCompleteModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex h-dvh w-full items-center justify-center overflow-hidden bg-black/55 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-complete-title"
        aria-describedby="order-complete-description"
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-14 items-center border-b border-border bg-card px-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-primary" />
            <h2
              id="order-complete-title"
              className="text-sm font-semibold text-foreground"
            >
              주문완료
            </h2>
          </div>
        </header>

        <div className="px-5 py-8 text-center sm:px-7 sm:py-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 size={30} strokeWidth={1.8} />
          </span>

          <p className="mt-5 text-base font-semibold text-foreground">
            주문이 성공적으로 접수되었습니다.
          </p>

          <p
            id="order-complete-description"
            className="mx-auto mt-2 max-w-[380px] text-xs leading-5 text-muted-foreground"
          >
            주문 처리는 근무일 기준으로 1~2일가량 소요될 수 있습니다.
          </p>
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-border bg-card px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onGoMain}
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            <LayoutGrid size={14} />
            메인으로 가기
          </button>

          <button
            type="button"
            onClick={onGoOrders}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ClipboardList size={14} />
            주문내역
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
