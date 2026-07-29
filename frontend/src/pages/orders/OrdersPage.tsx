import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/app/providers/AuthProvider";
import { API_BASE_URL } from "@/shared/constants/api";
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
  type BackendOrderResponse,
  type MappedOrder as Order,
  mapOrderResponse,
} from "@/shared/constants/orders";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: {
    message?: string;
  };
}

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
                {order.site}
              </span>
              <span className="mb-0.5 h-3 w-1 bg-[#55b936]" />
            </div>
            <span className="text-[6px] italic text-slate-500">
              “Smiling Technology”
            </span>
          </div>

          <div className="p-3 text-slate-600">
            <p className="text-[9px] font-semibold text-slate-900">{order.name}</p>
            <p className="mt-0.5 text-[5.5px]">Business Div. / Director</p>
            <p className="mt-3 text-[5.5px] font-semibold">{order.site}</p>
            <div className="mt-1 space-y-0.5 text-[5px] leading-tight">
              <p>{order.address || "22-6, Bangbaemae-ro 16gil, Seocho-gu"}</p>
              <p>TEL. {order.phone} / FAX. 02-572-8970</p>
              <p>contact@{order.site.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com</p>
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
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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

  const isOperator = useMemo(() => {
    return user?.roles?.some(
      (r) => r === "ROLE_OPERATOR" || r === "ROLE_SYSTEM_ADMIN",
    ) ?? false;
  }, [user]);

  // Fetch live orders from backend DB API
  useEffect(() => {
    if (!accessToken) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    async function fetchOrders() {
      try {
        setLoading(true);
        setLoadError("");

        const endpoint = isOperator
          ? `${API_BASE_URL}/api/v1/operator/orders`
          : `${API_BASE_URL}/api/v1/orders`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: abortController.signal,
        });

        const body = (await response
          .json()
          .catch(() => null)) as ApiResponse<BackendOrderResponse[]> | null;

        if (!response.ok) {
          const msg =
            body?.message ??
            body?.error?.message ??
            "주문 목록을 불러오지 못했습니다.";
          throw new Error(msg);
        }

        const data = body?.data;
        if (!Array.isArray(data)) {
          throw new Error("주문 목록 응답 형식이 올바르지 않습니다.");
        }

        setOrders(data.map(mapOrderResponse));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setOrders([]);
        setLoadError(
          error instanceof Error
            ? error.message
            : "주문 목록을 불러오지 못했습니다.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => abortController.abort();
  }, [accessToken, isOperator, reloadKey]);

  const orderCompanies = useMemo(() => {
    return Array.from(new Set(orders.map((o) => o.site))).sort((a, b) =>
      a.localeCompare(b, "ko"),
    );
  }, [orders]);

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
      id: order.rawId,
      orderNumber: order.id,
      department: order.site,
      product: "명함",
      material: order.material,
      quantity: order.quantity,
      memo: order.rejectReason
        ? `반려 사유: ${order.rejectReason}`
        : order.trackingNumber
        ? `배송방법: ${order.carrierCode || "택배"} / 송장번호: ${order.trackingNumber}`
        : "",
      customerName: order.name,
      phone: order.recipientPhone || order.phone,
      email: "contact@company.com",
      address: order.address || "06779 서울시 서초구 방배천로 22-6",
      detailAddress: order.addressDetail || "9층",
      status: order.status,
      createdAt: order.receivedAt,
    });
  }

  function handleOpenStatusChange(action: {
    label: string;
    variant?: string;
    targetTab?: OrderTab | null;
    targetStatus?: string;
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
      targetTab: action.targetTab,
      targetStatus: action.targetStatus,
    });
  }

  async function handleConfirmStatusChange(request: OrderStatusChangeRequest) {
    if (!accessToken) return;

    try {
      const selectedOrders = orders.filter((o) => request.orderIds.includes(o.id));

      for (const order of selectedOrders) {
        const rawId = order.rawId;

        if (request.actionLabel === "영구 삭제" || request.targetStatus === "DELETE") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else if (request.actionLabel === "주문 승인" || request.targetStatus === "APPROVED") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/approve`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else if (request.actionLabel === "주문 반려" || request.targetStatus === "REJECTED") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/reject`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: request.reason || "검수 반려" }),
          });
        } else if (request.targetStatus) {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/status`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: request.targetStatus }),
          });
        } else if (request.actionLabel === "인쇄 시작") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/status`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "PRINTING" }),
          });
        } else if (request.actionLabel === "주문 취소") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/status`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "CANCELLED" }),
          });
        } else if (request.actionLabel === "재승인 요청") {
          await fetch(`${API_BASE_URL}/api/v1/operator/orders/${rawId}/status`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "PENDING" }),
          });
        }
      }

      // Automatically switch to targetTab if specified (Image 1 specification)
      if (request.targetTab) {
        setActiveTab(request.targetTab as OrderTab);
        setPage(1);
      }
    } catch (err) {
      console.error("Status change error:", err);
    } finally {
      setStatusChangeRequest(null);
      setSelectedIds(new Set());
      setReloadKey((k) => k + 1);
    }
  }

  function handleOpenShipmentTracking(order: Order) {
    setShipmentTrackingOrder({
      id: order.id,
      name: order.name,
      site: order.site,
      shippingMethod: order.carrierCode || "택배",
      trackingNumber: order.trackingNumber || "",
    });
  }

  async function handleConfirmShipmentTracking({
    orderId,
    shippingMethod,
    trackingNumber,
  }: ShipmentTrackingSubmitPayload) {
    if (!accessToken) return;

    const targetOrder = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!targetOrder) return;

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/operator/orders/${targetOrder.rawId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "SHIPPED",
            carrierCode: shippingMethod,
            trackingNumber,
          }),
        },
      );
    } catch (err) {
      console.error("Shipment tracking error:", err);
    } finally {
      setShipmentTrackingOrder(null);
      setSelectedIds(new Set());
      setReloadKey((k) => k + 1);
    }
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
          <h1 className="text-lg font-semibold text-foreground md:text-xl">
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
        companies={orderCompanies}
        companyLabel="사이트"
      />

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

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
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors md:px-4 ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2 text-xs">
            <span className="text-muted-foreground">
              {selectedCount > 0
                ? `${selectedCount}개 선택됨`
                : "처리할 항목을 선택하세요"}
            </span>

            <div className="flex gap-1.5">
              {actions.map((action) => (
                <button
                  key={action.label}
                  disabled={selectedCount === 0}
                  onClick={() => handleOpenStatusChange(action)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    action.variant === "danger"
                      ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : action.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-medium text-muted-foreground">
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-3 py-2.5">주문번호</th>
                <th className="px-3 py-2.5">접수일시</th>
                <th className="px-3 py-2.5">고객사</th>
                <th className="px-3 py-2.5">주문자</th>
                <th className="px-3 py-2.5">전화번호</th>
                <th className="px-3 py-2.5">재질/수량</th>
                <th className="px-3 py-2.5">상태</th>
                <th className="px-3 py-2.5 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    주문 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    조건에 해당하는 주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paged.map((order) => {
                  const isSelected = selectedIds.has(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-secondary/30 ${
                        isSelected ? "bg-secondary/40" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(order.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-3 py-3 font-mono font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {order.receivedAt}
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground">
                        {order.site}
                      </td>
                      <td className="px-3 py-3 text-foreground">{order.name}</td>
                      <td className="px-3 py-3 font-mono text-muted-foreground">
                        {order.phone}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {order.material} · {order.quantity.toLocaleString()}매
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <OrderActions
                          order={order}
                          onOpenDetail={handleOpenOrderDetail}
                          onOpenShipmentTracking={handleOpenShipmentTracking}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPage={setPage}
        />
      </div>

      <OrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <OrderStatusChangeConfirmModal
        open={Boolean(statusChangeRequest)}
        request={statusChangeRequest}
        onClose={() => setStatusChangeRequest(null)}
        onConfirm={handleConfirmStatusChange}
      />

      <ShipmentTrackingModal
        open={Boolean(shipmentTrackingOrder)}
        order={shipmentTrackingOrder}
        onClose={() => setShipmentTrackingOrder(null)}
        onConfirm={handleConfirmShipmentTracking}
      />
    </div>
  );
}
