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
  id: number | string;
  orderNo: string;
  companyId: number | string;
  companyName: string;
  memberId: number | string;
  memberName: string;
  templateId: number | string;
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
  price?: number | string | null;
  shippingFee?: number | string | null;
}

export interface MappedOrder {
  rawId: number | string;
  id: string;
  templateId: number | string;
  receivedAt: string;
  site: string;
  material: string;
  quantity: number;
  phone: string;
  name: string;
  price: string;
  shippingFee: string;
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

export function formatOrderDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dayOfWeek = days[d.getDay()];
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} (${dayOfWeek}) ${hh}:${min}`;
  } catch {
    return dateStr;
  }
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

  const calculatedPrice = dto.price ? Number(dto.price) : (quantity > 0 ? quantity * 75 : 15000);
  const priceStr = `${calculatedPrice.toLocaleString()}원`;

  const shippingFeeStr = "0원";

  return {
    rawId: dto.id,
    id: dto.orderNo || String(dto.id),
    templateId: dto.templateId || 1,
    receivedAt: dto.createdAt || new Date().toISOString(),
    site: dto.companyName || "고객사 미지정",
    material,
    quantity,
    phone: dto.recipientPhone || "010-0000-0000",
    name: dto.memberName || dto.recipientName || "주문자 미지정",
    price: priceStr,
    shippingFee: shippingFeeStr,
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
  { id: "ORD-8821", receivedAt: "2026-07-21T14:30:00", site: "제일엔지니어링", material: "휘라레 216g", quantity: 2000, phone: "010-2451-8821", name: "김민준", price: "150,000원", shippingFee: "0원", status: "승인대기" },
  { id: "ORD-8820", receivedAt: "2026-07-21T11:15:00", site: "테크코리아", material: "스노우지 250g", quantity: 500, phone: "010-7392-1048", name: "이서연", price: "37,500원", shippingFee: "0원", status: "승인대기" },
  { id: "ORD-8819", receivedAt: "2026-07-20T16:45:00", site: "디지털솔루션", material: "반누보 227g", quantity: 1000, phone: "010-5631-9074", name: "박지훈", price: "75,000원", shippingFee: "0원", status: "승인완료" },
  { id: "ORD-8818", receivedAt: "2026-07-20T09:20:00", site: "한국IT", material: "휘라레 216g", quantity: 200, phone: "010-8164-3320", name: "최수아", price: "15,000원", shippingFee: "0원", status: "인쇄중" },
  { id: "ORD-8817", receivedAt: "2026-07-19T17:10:00", site: "제일엔지니어링", material: "스노우지 250g", quantity: 500, phone: "010-4072-6651", name: "정우진", price: "37,500원", shippingFee: "0원", status: "주문취소" },
  { id: "ORD-8816", receivedAt: "2026-07-19T13:05:00", site: "테크코리아", material: "랑데뷰 240g", quantity: 1000, phone: "010-9285-1473", name: "강예은", price: "75,000원", shippingFee: "0원", status: "발송완료" },
];
