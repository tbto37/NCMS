export const ORDER_TABS = ["전체", "승인대기", "승인완료", "인쇄중", "발송완료", "승인반려", "주문취소"] as const;
export type OrderTab = typeof ORDER_TABS[number];

export interface TabActionItem {
  label: string;
  variant: "primary" | "danger" | "ghost";
  targetTab?: OrderTab | null;
  targetStatus?: string;
}

export const TAB_ACTIONS: Record<OrderTab, TabActionItem[]> = {
  전체:     [],
  승인대기: [
    { label: "주문 승인", variant: "primary", targetTab: "승인완료", targetStatus: "APPROVED" },
    { label: "주문 취소", variant: "danger", targetTab: "주문취소", targetStatus: "CANCELLED" },
    { label: "주문 반려", variant: "danger", targetTab: "승인반려", targetStatus: "REJECTED" },
  ],
  승인완료: [
    { label: "인쇄 시작", variant: "primary", targetTab: "인쇄중", targetStatus: "PRINTING" },
    { label: "주문 취소", variant: "danger", targetTab: "주문취소", targetStatus: "CANCELLED" },
  ],
  인쇄중:   [
    { label: "발송 처리", variant: "primary", targetTab: "발송완료", targetStatus: "SHIPPED" },
  ],
  발송완료: [],
  승인반려: [
    { label: "재승인 요청", variant: "primary", targetTab: "승인대기", targetStatus: "PENDING" },
    { label: "주문 취소", variant: "danger", targetTab: "주문취소", targetStatus: "CANCELLED" },
  ],
  주문취소: [
    { label: "영구 삭제", variant: "danger", targetTab: null, targetStatus: "DELETE" },
  ],
};

export const ORDER_FILTER_FIELDS = [
  { value: "id", label: "주문번호" },
  { value: "name", label: "이름" },
  { value: "phone", label: "전화번호" },
  { value: "site", label: "사이트" },
] as const;

export const ORDER_COMPANIES = ["제일엔지니어링", "테크코리아", "디지털솔루션", "한국IT"];

export interface BackendOrderResponse {
  id: string;
  orderNo: string;
  companyId: string;
  companyName: string;
  memberId: string;
  memberName: string;
  templateId: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
  zipcode: string | null;
  address: string | null;
  addressDetail: string | null;
  rejectReason: string | null;
  cardDataJson: string | null;
  productOptionSummary: string | null;
  carrierCode: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

export interface MappedOrder {
  rawId: string;
  id: string;
  receivedAt: string;
  site: string;
  material: string;
  quantity: number;
  phone: string;
  name: string;
  status: OrderTab;
  recipientName: string;
  recipientPhone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  rejectReason: string;
  cardDataJson: string;
  productOptionSummary: string;
  carrierCode: string;
  trackingNumber: string;
}

export function mapBackendStatusToTab(status: string): OrderTab {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "승인대기";
    case "APPROVED":
      return "승인완료";
    case "PRINTING":
      return "인쇄중";
    case "SHIPPED":
    case "DELIVERED":
      return "발송완료";
    case "REJECTED":
      return "승인반려";
    case "CANCELLED":
      return "주문취소";
    default:
      return "승인대기";
  }
}

export function mapOrderResponse(dto: BackendOrderResponse): MappedOrder {
  let material = "일반용지 200g";
  let quantity = 200;

  if (dto.productOptionSummary) {
    const parts = dto.productOptionSummary.split("/").map((s) => s.trim());
    if (parts[0]) material = parts[0];
    if (parts[1]) {
      const parsed = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);
      if (!isNaN(parsed)) quantity = parsed;
    }
  }

  let receivedAt = "";
  if (dto.createdAt) {
    receivedAt = dto.createdAt.substring(0, 10);
  }

  return {
    rawId: dto.id,
    id: dto.orderNo || dto.id,
    receivedAt: receivedAt || new Date().toISOString().substring(0, 10),
    site: dto.companyName || "고객사 미지정",
    material,
    quantity,
    phone: dto.recipientPhone || "010-0000-0000",
    name: dto.memberName || dto.recipientName || "주문자 미지정",
    status: mapBackendStatusToTab(dto.status),
    recipientName: dto.recipientName || "",
    recipientPhone: dto.recipientPhone || "",
    zipcode: dto.zipcode || "",
    address: dto.address || "",
    addressDetail: dto.addressDetail || "",
    rejectReason: dto.rejectReason || "",
    cardDataJson: dto.cardDataJson || "{}",
    productOptionSummary: dto.productOptionSummary || "",
    carrierCode: dto.carrierCode || "",
    trackingNumber: dto.trackingNumber || "",
  };
}

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
