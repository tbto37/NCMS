import { useState } from "react";
import {
  Download,
  Eye,
  FileDown,
  Package,
  ReceiptText,
  Truck,
} from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import OrderDetailModal, {
  type OrderDetailData,
} from "./components/OrderDetailModal";
import OrderStatusChangeConfirmModal, {
  type OrderStatusChangeRequest,
} from "./components/OrderStatusChangeConfirmModal";
import ShipmentTrackingModal, {
  type ShipmentTrackingOrder,
  type ShipmentTrackingSubmitPayload,
} from "./components/ShipmentTrackingModal";
import { PAGE_SIZE } from "@/shared/constants/pagination";
import {
  ORDER_TABS,
  type OrderTab,
  TAB_ACTIONS,
  ORDER_FILTER_FIELDS,
  ORDER_COMPANIES,
  allOrders,
} from "@/shared/constants/orders";

type BaseOrder = (typeof allOrders)[number];
type Order = BaseOrder & {
  shippingMethod?: string;
  trackingNumber?: string;
};

interface ActionIconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

interface OrderActionsProps {
  order: Order;
  onOpenDetail: (order: Order) => void;
  onOpenShipmentTracking: (order: Order) => void;
}

const ACTION_TO_STATUS_MAP: Partial<Record<string, OrderTab>> = {
  "주문 승인": "승인완료",
  "주문 반려": "승인반려",
  "인쇄 시작": "인쇄중",
  "발송 처리": "발송완료",
  "재승인 요청": "승인대기",
  "주문 취소": "주문취소",
};

function ActionIconButton({ label, onClick, children }: ActionIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function BusinessCardPreview({ order }: { order: Order }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">명함 미리보기</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {order.name} · {order.id}
          </p>
        </div>
        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          앞면
        </span>
      </div>

      <div className="aspect-[1.75/1] overflow-hidden rounded border border-border bg-white shadow-sm">
        <div className="grid h-[calc(100%-5px)] grid-cols-[35%_65%]">
          <div className="flex flex-col justify-between border-r border-slate-200 p-3">
            <div className="flex items-end gap-0.5">
              <span className="text-lg font-black tracking-[-0.08em] text-[#06418f]">
                CHEIL
              </span>
              <span className="mb-0.5 h-3 w-1 bg-[#55b936]" />
            </div>
            <span className="text-[6px] italic text-slate-500">
              “Smiling Technology”
            </span>
          </div>

          <div className="p-3 text-slate-600">
            <p className="text-[9px] font-semibold text-slate-900">{order.name}</p>
            <p className="mt-0.5 text-[5.5px]">Highway Eng. Business Div. / Director</p>
            <p className="mt-3 text-[5.5px] font-semibold">CHEIL ENGINEERING CO., LTD.</p>
            <div className="mt-1 space-y-0.5 text-[5px] leading-tight">
              <p>22-6, Bangbaemae-ro 16gil, Seocho-gu</p>
              <p>TEL. 02-3498-2600 / FAX. 02-572-8970</p>
              <p>youremail@email.com</p>
            </div>
          </div>
        </div>
        <div className="flex h-[5px]">
          <div className="w-[13%] bg-[#55b936]" />
          <div className="flex-1 bg-[#06418f]" />
        </div>
      </div>
    </div>
  );
}

function OrderActions({
                        order,
                        onOpenDetail,
                        onOpenShipmentTracking,
                      }: OrderActionsProps) {
  const handleAction = (action: string) => {
    console.info(`[${action}]`, order.id);
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <ActionIconButton label="주문 상세" onClick={() => onOpenDetail(order)}>
        <ReceiptText size={13} />
      </ActionIconButton>

      <ActionIconButton label="PDF 저장" onClick={() => handleAction("PDF 저장")}>
        <FileDown size={13} />
      </ActionIconButton>

      <HoverCard openDelay={150} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label="명함 미리보기"
            title="명함 미리보기"
            onClick={(event) => {
              event.stopPropagation();
              handleAction("명함 미리보기");
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground"
          >
            <Eye size={13} />
          </button>
        </HoverCardTrigger>

        <HoverCardContent align="end" side="left" sideOffset={10} className="w-72 p-3">
          <BusinessCardPreview order={order} />
        </HoverCardContent>
      </HoverCard>

      <ActionIconButton
        label="배송 추적"
        onClick={() => onOpenShipmentTracking(order)}
      >
        <Truck size={13} />
      </ActionIconButton>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(allOrders);
  const [activeTab, setActiveTab] = useState<OrderTab>("전체");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [company, setCompany] = useState("");
  const [filterField, setFilterField] = useState("id");
  const [filterValue, setFilterValue] = useState("");
  const [applied, setApplied] = useState({
    company: "",
    filterField: "id",
    filterValue: "",
    dateFrom: "",
    dateTo: "",
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [statusChangeRequest, setStatusChangeRequest] =
    useState<OrderStatusChangeRequest | null>(null);
  const [shipmentTrackingOrder, setShipmentTrackingOrder] =
    useState<ShipmentTrackingOrder | null>(null);

  function handleSearch() {
    setApplied({ company, filterField, filterValue, dateFrom, dateTo });
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setCompany("");
    setFilterField("id");
    setFilterValue("");
    setApplied({
      company: "",
      filterField: "id",
      filterValue: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
    setSelectedIds(new Set());
  }

  const tabFiltered =
    activeTab === "전체"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  const searched = tabFiltered.filter((order) => {
    if (applied.filterValue) {
      const value = applied.filterValue.toLowerCase();
      const field = applied.filterField as keyof Order;

      if (!String(order[field] ?? "").toLowerCase().includes(value)) {
        return false;
      }
    }

    if (applied.company && order.site !== applied.company) return false;
    if (applied.dateFrom && order.receivedAt < applied.dateFrom) return false;
    if (applied.dateTo && order.receivedAt > applied.dateTo) return false;

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paged = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paged.length > 0 && paged.every((order) => selectedIds.has(order.id));
  const selectedCount = paged.filter((order) => selectedIds.has(order.id)).length;

  function handleOpenOrderDetail(order: Order) {
    setSelectedOrder({
      id: order.id,
      orderNumber: order.id,
      department: order.site,
      product: "명함",
      material: order.material,
      quantity: order.quantity,
      memo: order.trackingNumber
        ? `배송방법: ${order.shippingMethod || "택배"} / 송장번호: ${order.trackingNumber}`
        : "",
      customerName: order.name,
      phone: order.phone,
      email: "youremail@email.com",
      address: "06779 서울시 서초구 방배천로 22-6",
      detailAddress: "9층",
      status: order.status,
      createdAt: order.receivedAt,
    });
  }

  function handleOpenStatusChange(action: {
    label: string;
    variant?: string;
  }) {
    const orderIds = paged
      .filter((order) => selectedIds.has(order.id))
      .map((order) => order.id);

    if (orderIds.length === 0) return;

    setStatusChangeRequest({
      actionLabel: action.label,
      orderIds,
      currentStatus: activeTab,
      variant: action.variant,
    });
  }

  function handleOpenShipmentTracking(order: Order) {
    setShipmentTrackingOrder({
      id: order.id,
      name: order.name,
      site: order.site,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
    });
  }

  function handleConfirmShipmentTracking({
                                           orderId,
                                           shippingMethod,
                                           trackingNumber,
                                         }: ShipmentTrackingSubmitPayload) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            status: "발송완료",
            shippingMethod,
            trackingNumber,
          }
          : order,
      ),
    );

    setShipmentTrackingOrder(null);
    setSelectedIds(new Set());
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (allSelected) paged.forEach((order) => next.delete(order.id));
      else paged.forEach((order) => next.add(order.id));

      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleTabChange(tab: OrderTab) {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds(new Set());
  }

  const actions = TAB_ACTIONS[activeTab];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-semibold text-foreground md:text-xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            주문 관리
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">총 {orders.length}건</p>
        </div>
        <button className="flex items-center gap-1.5 rounded border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-secondary">
          <Download size={11} />
          <span className="hidden sm:inline">내보내기</span>
        </button>
      </div>

      <SearchBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        company={company}
        filterField={filterField}
        filterValue={filterValue}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onCompany={setCompany}
        onFilterField={setFilterField}
        onFilterValue={setFilterValue}
        onSearch={handleSearch}
        onReset={handleReset}
        filterFields={ORDER_FILTER_FIELDS}
        companies={ORDER_COMPANIES}
        companyLabel="사이트"
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex overflow-x-auto border-b border-border">
          {ORDER_TABS.map((tab) => {
            const count =
              tab === "전체"
                ? orders.length
                : orders.filter((order) => order.status === tab).length;
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors md:px-4 ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-xs ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {paged.length === 0 ? (
          <div className="flex h-[510px] flex-col items-center justify-center text-muted-foreground">
            <Package size={32} className="mb-3 opacity-30" />
            <p className="text-xs">해당 조건의 주문이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="hidden h-[510px] overflow-auto md:block">
              <table className="w-full min-w-[1280px] table-fixed">
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
                <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="w-8 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-border accent-primary"
                    />
                  </th>
                  {[
                    "접수일자",
                    "사이트",
                    "주문번호",
                    "재질",
                    "수량",
                    "전화번호",
                    "이름",
                    "주문상태",
                    "액션",
                  ].map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-2.5 text-xs font-medium tracking-wider text-muted-foreground ${
                        header === "액션" ? "text-right" : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-border">
                {paged.map((order) => {
                  const checked = selectedIds.has(order.id);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => toggleOne(order.id)}
                      className={`cursor-pointer transition-colors hover:bg-secondary/40 ${
                        checked ? "bg-secondary/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(order.id)}
                          className="rounded border-border accent-primary"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {order.receivedAt}
                      </td>
                      <td className="truncate px-4 py-3 text-xs text-muted-foreground">
                        {order.site}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {order.id}
                      </td>
                      <td className="truncate px-4 py-3 text-xs text-muted-foreground">
                        {order.material}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-medium">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {order.phone}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {order.name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>
                        <OrderActions
                          order={order}
                          onOpenDetail={handleOpenOrderDetail}
                          onOpenShipmentTracking={handleOpenShipmentTracking}
                        />
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            <div className="h-[510px] divide-y divide-border overflow-y-auto md:hidden">
              <div className="flex items-center gap-3 bg-secondary/40 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  전체 선택 ({paged.length}건)
                </span>
              </div>
              {paged.map((order) => {
                const checked = selectedIds.has(order.id);

                return (
                  <div
                    key={order.id}
                    onClick={() => toggleOne(order.id)}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                      checked ? "bg-secondary/60" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(order.id)}
                      className="mt-0.5 shrink-0 rounded border-border accent-primary"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.id}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-foreground">
                          {order.name}
                        </span>
                        <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {order.site}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {order.material} · {order.quantity.toLocaleString()}개
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.phone}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.receivedAt}
                        </span>
                      </div>
                      <div
                        className="mt-2 border-t border-border pt-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <OrderActions
                          order={order}
                          onOpenDetail={handleOpenOrderDetail}
                          onOpenShipmentTracking={handleOpenShipmentTracking}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {actions.length > 0 && (
              <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {selectedCount > 0 ? `${selectedCount}건 선택됨` : "항목을 선택하세요"}
                </span>
                <div className="flex items-center gap-2">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      disabled={selectedCount === 0}
                      onClick={() => handleOpenStatusChange(action)}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        action.variant === "primary"
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : action.variant === "danger"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "border border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={(nextPage) => {
                setPage(nextPage);
                setSelectedIds(new Set());
              }}
            />
          </>
        )}
      </div>

      <OrderDetailModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <ShipmentTrackingModal
        open={shipmentTrackingOrder !== null}
        order={shipmentTrackingOrder}
        onClose={() => setShipmentTrackingOrder(null)}
        onConfirm={handleConfirmShipmentTracking}
      />

      <OrderStatusChangeConfirmModal
        open={statusChangeRequest !== null}
        request={statusChangeRequest}
        onClose={() => setStatusChangeRequest(null)}
        onConfirm={(request) => {
          console.log("주문 상태 변경:", request);

          const nextStatus = ACTION_TO_STATUS_MAP[request.actionLabel];

          if (nextStatus) {
            setOrders((prev) =>
              prev.map((order) =>
                request.orderIds.includes(order.id)
                  ? { ...order, status: nextStatus }
                  : order,
              ),
            );
          }

          setStatusChangeRequest(null);
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
