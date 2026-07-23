export const ORDER_TABS = ["전체", "승인대기", "승인완료", "인쇄중", "발송완료", "승인반려", "주문취소"] as const;
export type OrderTab = typeof ORDER_TABS[number];

export const TAB_ACTIONS: Record<OrderTab, { label: string; variant: "primary" | "danger" | "ghost" }[]> = {
  전체:     [],
  승인대기: [{ label: "주문 승인", variant: "primary" }, { label: "주문 반려", variant: "danger" }],
  승인완료: [{ label: "인쇄 시작", variant: "primary" }],
  인쇄중:   [{ label: "발송 처리", variant: "primary" }],
  발송완료: [{ label: "상세 보기", variant: "ghost" }],
  승인반려: [{ label: "재승인 요청", variant: "primary" }, { label: "주문 취소", variant: "danger" }],
  주문취소: [{ label: "상세 보기", variant: "ghost" }],
};

export const ORDER_FILTER_FIELDS = [
  { value: "id", label: "주문번호" },
  { value: "customer", label: "고객명" },
  { value: "product", label: "상품명" },
];

export const ORDER_COMPANIES = ["주식회사 예시", "테크코리아", "디지털솔루션", "한국IT"];

export const allOrders = [
  { id: "ORD-8821", customer: "김민준", product: "MacBook Pro 14인치", category: "전자제품", amount: 2990000, status: "승인대기", date: "2026-07-21" },
  { id: "ORD-8820", customer: "이서연", product: "Nike Air Max 2026", category: "의류", amount: 189000, status: "승인대기", date: "2026-07-21" },
  { id: "ORD-8819", customer: "박지훈", product: "삼성 QLED 65인치", category: "전자제품", amount: 1590000, status: "승인완료", date: "2026-07-20" },
  { id: "ORD-8818", customer: "최수아", product: "에어팟 Pro 3세대", category: "전자제품", amount: 359000, status: "인쇄중", date: "2026-07-20" },
  { id: "ORD-8817", customer: "정우진", product: "아이패드 Air M3", category: "전자제품", amount: 999000, status: "주문취소", date: "2026-07-19" },
  { id: "ORD-8816", customer: "강예은", product: "리넨 셔츠 세트", category: "의류", amount: 89000, status: "발송완료", date: "2026-07-19" },
  { id: "ORD-8815", customer: "조현서", product: "유기농 그래놀라", category: "식품", amount: 42000, status: "승인반려", date: "2026-07-18" },
  { id: "ORD-8814", customer: "윤하은", product: "원목 책상 1200", category: "가구", amount: 450000, status: "승인완료", date: "2026-07-18" },
  { id: "ORD-8813", customer: "한도윤", product: "무선 마우스 Pro", category: "전자제품", amount: 79000, status: "인쇄중", date: "2026-07-18" },
  { id: "ORD-8812", customer: "오지민", product: "캐시미어 코트", category: "의류", amount: 380000, status: "발송완료", date: "2026-07-17" },
  { id: "ORD-8811", customer: "임서준", product: "프로틴 파우더 2kg", category: "식품", amount: 65000, status: "승인대기", date: "2026-07-17" },
  { id: "ORD-8810", customer: "권나은", product: "원목 선반 세트", category: "가구", amount: 210000, status: "승인반려", date: "2026-07-16" },
];
