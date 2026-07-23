import { CheckCircle, XCircle, Clock } from "lucide-react";
import { statusConfig } from "@/shared/constants/status";

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "#6b6860", bg: "#eceae5" };
  const icon =
    status === "발송완료" || status === "활성" ? <CheckCircle size={10} /> :
      status === "승인반려" || status === "주문취소" || status === "비활성" ? <XCircle size={10} /> :
        <Clock size={10} />;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {icon}
      {cfg.label}
    </span>
  );
}
