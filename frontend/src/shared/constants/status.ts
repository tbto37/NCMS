export const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  승인대기: { label: "승인대기", color: "#d97706", bg: "#fef3c7" },
  승인완료: { label: "승인완료", color: "#2563eb", bg: "#dbeafe" },
  인쇄중:   { label: "인쇄중",   color: "#7c3aed", bg: "#ede9fe" },
  발송완료: { label: "발송완료", color: "#16a34a", bg: "#dcfce7" },
  승인반려: { label: "승인반려", color: "#dc2626", bg: "#fee2e2" },
  주문취소: { label: "주문취소", color: "#6b6860", bg: "#eceae5" },
  활성: { label: "활성", color: "#16a34a", bg: "#dcfce7" },
  비활성: { label: "비활성", color: "#6b6860", bg: "#eceae5" },
  보류: { label: "보류", color: "#d97706", bg: "#fef3c7" },
};
