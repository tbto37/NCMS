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
  { value: "name", label: "이름" },
  { value: "phone", label: "전화번호" },
  { value: "site", label: "사이트" },
];

export const ORDER_COMPANIES = ["제일엔지니어링", "테크코리아", "디지털솔루션", "한국IT"];

export const allOrders = [
  { id: "ORD-8821", receivedAt: "2026-07-21", site: "제일엔지니어링", material: "휘라레 216g", quantity: 2000, phone: "010-2451-8821", name: "김민준", status: "승인대기" },
  { id: "ORD-8820", receivedAt: "2026-07-21", site: "테크코리아", material: "스노우지 250g", quantity: 500, phone: "010-7392-1048", name: "이서연", status: "승인대기" },
  { id: "ORD-8819", receivedAt: "2026-07-20", site: "디지털솔루션", material: "반누보 227g", quantity: 1000, phone: "010-5631-9074", name: "박지훈", status: "승인완료" },
  { id: "ORD-8818", receivedAt: "2026-07-20", site: "한국IT", material: "휘라레 216g", quantity: 200, phone: "010-8164-3320", name: "최수아", status: "인쇄중" },
  { id: "ORD-8817", receivedAt: "2026-07-19", site: "제일엔지니어링", material: "스노우지 250g", quantity: 500, phone: "010-4072-6651", name: "정우진", status: "주문취소" },
  { id: "ORD-8816", receivedAt: "2026-07-19", site: "테크코리아", material: "랑데뷰 240g", quantity: 1000, phone: "010-9285-1473", name: "강예은", status: "발송완료" },
  { id: "ORD-8815", receivedAt: "2026-07-18", site: "디지털솔루션", material: "반누보 227g", quantity: 200, phone: "010-3518-7206", name: "조현서", status: "승인반려" },
  { id: "ORD-8814", receivedAt: "2026-07-18", site: "한국IT", material: "휘라레 216g", quantity: 500, phone: "010-6820-4395", name: "윤하은", status: "승인완료" },
  { id: "ORD-8813", receivedAt: "2026-07-18", site: "제일엔지니어링", material: "랑데뷰 240g", quantity: 2000, phone: "010-1746-8539", name: "한도윤", status: "인쇄중" },
  { id: "ORD-8812", receivedAt: "2026-07-17", site: "테크코리아", material: "스노우지 250g", quantity: 1000, phone: "010-7954-2618", name: "오지민", status: "발송완료" },
  { id: "ORD-8811", receivedAt: "2026-07-17", site: "디지털솔루션", material: "휘라레 216g", quantity: 500, phone: "010-2307-5941", name: "임서준", status: "승인대기" },
  { id: "ORD-8810", receivedAt: "2026-07-16", site: "한국IT", material: "반누보 227g", quantity: 200, phone: "010-6483-0197", name: "권나은", status: "승인반려" },
];
