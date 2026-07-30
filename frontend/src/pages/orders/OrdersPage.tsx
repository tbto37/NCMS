import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileDown,
  Package,
  Printer,
  ReceiptText,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DynamicBusinessCardPreview from "@/components/card/DynamicBusinessCardPreview";
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
  getTabActions,
  ORDER_FILTER_FIELDS,
  type BackendOrderResponse,
  type MappedOrder as Order,
  mapOrderResponse,
  formatOrderDate,
} from "@/shared/constants/orders";
import type { BusinessCardInputData } from "@/shared/types/businessCard";

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
  onPrint: (order: Order) => void;
  onReorder?: (order: Order) => void;
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
  let parsed: BusinessCardInputData | null = null;
  if (order.cardDataJson) {
    try {
      parsed = JSON.parse(order.cardDataJson);
    } catch (e) {
      console.error(e);
    }
  }

  const templateId = order.templateId || "T_CHEIL";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <p className="text-xs font-bold text-foreground">명함 실시간 미리보기</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {order.name} · {order.id} ({order.site})
          </p>
        </div>
      </div>

      {parsed ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground">
              [앞면]
            </span>
            <DynamicBusinessCardPreview
              templateId={templateId}
              cardData={parsed}
              isBack={false}
              scale={0.95}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground">
              [뒷면]
            </span>
            <DynamicBusinessCardPreview
              templateId={templateId}
              cardData={parsed}
              isBack={true}
              scale={0.95}
            />
          </div>
        </div>
      ) : (
        <div className="aspect-[1.75/1] flex items-center justify-center rounded-lg border border-border bg-white p-4 text-xs text-muted-foreground">
          명함 미리보기 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

function OrderActions({
  order,
  onOpenDetail,
  onOpenShipmentTracking,
  onPrint,
  onReorder,
}: OrderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {order.status === "승인반려" && onReorder && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReorder(order);
          }}
          className="flex h-7 items-center gap-1 rounded bg-amber-500/10 px-2 text-[11px] font-medium text-amber-600 hover:bg-amber-500/20"
        >
          <RotateCcw size={11} />
          재주문
        </button>
      )}

      <ActionIconButton label="주문 상세" onClick={() => onOpenDetail(order)}>
        <ReceiptText size={13} />
      </ActionIconButton>

      <ActionIconButton label="명함 인쇄 / PDF" onClick={() => onPrint(order)}>
        <Printer size={13} />
      </ActionIconButton>

      <HoverCard openDelay={150} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label="명함 미리보기"
            title="명함 미리보기"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetail(order);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground"
          >
            <Eye size={13} />
          </button>
        </HoverCardTrigger>

        <HoverCardContent align="end" side="left" sideOffset={12} className="w-[470px] max-h-[85vh] overflow-y-auto p-4">
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
  const navigate = useNavigate();
  const { companyCode } = useParams<{ companyCode?: string }>();
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
  const [nameSearch, setNameSearch] = useState("");
  const [applied, setApplied] = useState({
    company: "",
    nameSearch: "",
    dateFrom: "",
    dateTo: "",
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [statusChangeRequest, setStatusChangeRequest] =
    useState<OrderStatusChangeRequest | null>(null);
  const [shipmentTrackingOrder, setShipmentTrackingOrder] =
    useState<ShipmentTrackingOrder | null>(null);

  const [dbCompanies, setDbCompanies] = useState<string[]>([]);

  function handleReorder(order: Order) {
    let cardData: BusinessCardInputData | undefined = undefined;
    if (order.cardDataJson) {
      try {
        cardData = JSON.parse(order.cardDataJson);
      } catch (e) {
        console.error("Failed to parse cardDataJson", e);
      }
    }

    const reorderData = {
      templateId: order.templateId,
      cardData: cardData || {
        front: {
          name: order.name,
          departmentOption: "직접입력",
          department: order.site,
          position1Option: "직접입력",
          position1: "",
          position2Option: "직접입력",
          position2: "",
          address: order.address,
          telephone: order.phone,
          fax: "",
          directTelephone: "",
          mobile: order.phone,
          email: "",
          website: "",
        },
        back: {
          name: "",
          department: "",
          position1: "",
          position2: "",
          address1: "",
          address2: "",
          telephone: "",
          fax: "",
          directTelephone: "",
          mobile: "",
          email: "",
          website: "",
        },
      },
      recipientName: order.recipientName || order.name,
      recipientPhone: order.recipientPhone || order.phone,
      zipcode: order.zipcode,
      address: order.address,
      addressDetail: order.addressDetail,
      material: order.material,
      quantity: order.quantity,
    };

    const targetUrl = companyCode ? `/${companyCode}/orders/form` : `/admin/orders/form`;
    navigate(targetUrl, { state: { reorderData } });
  }

  function handlePrintOrder(order: Order) {
    let parsed: BusinessCardInputData | null = null;
    if (order.cardDataJson) {
      try {
        parsed = JSON.parse(order.cardDataJson);
      } catch (e) {
        console.error(e);
      }
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      alert("팝업이 차단되었습니다. 팝업을 허용해 주세요.");
      return;
    }

    const frontName = parsed?.front?.name || order.name;
    const frontDept = parsed?.front?.department || order.site;
    const frontPos = parsed?.front?.position1 || "";
    const frontPhone = parsed?.front?.mobile || order.phone;
    const frontEmail = parsed?.front?.email || "";
    const frontAddress = parsed?.front?.address || order.address;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>명함 인쇄 - ${order.id}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; margin: 0; padding: 20px; color: #333; }
          .card-container { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; }
          .card-box {
            width: 90mm;
            height: 50mm;
            border: 1px solid #ccc;
            padding: 15px;
            box-sizing: border-box;
            background: #fff;
            position: relative;
            border-radius: 4px;
          }
          .company { font-size: 14px; font-weight: bold; color: #06418f; }
          .name { font-size: 16px; font-weight: bold; margin-top: 10px; }
          .title { font-size: 10px; color: #666; margin-bottom: 10px; }
          .contact { font-size: 9px; color: #444; line-height: 1.4; position: absolute; bottom: 12px; }
          .btn-print { padding: 8px 16px; background: #06418f; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px;">
          <button class="btn-print" onclick="window.print()">🖨️ 명함 즉시 인쇄 (PDF 저장)</button>
        </div>
        <h2>NCMS 명함 인쇄용 스냅샷 [주문번호: ${order.id}]</h2>
        <p>고객사: ${order.site} | 주문자: ${order.name} | 재질: ${order.material} | 수량: ${order.quantity}개</p>
        <div class="card-container">
          <div class="card-box">
            <div class="company">${order.site}</div>
            <div class="name">${frontName} <span style="font-size:11px; font-weight:normal;">${frontPos}</span></div>
            <div class="title">${frontDept}</div>
            <div class="contact">
              <div>TEL: ${frontPhone} ${frontEmail ? '| EMAIL: ' + frontEmail : ''}</div>
              <div>${frontAddress}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  const isOperator = useMemo(() => {
    const isOperatorRole = user?.roles?.some(
      (r) =>
        r === "ROLE_OPERATOR" ||
        r === "OPERATOR" ||
        r === "ROLE_SYSTEM_ADMIN" ||
        r === "SYSTEM_ADMIN",
    ) ?? false;

    const pathname = location.pathname.toLowerCase();
    const isOperatorRoute =
      pathname === "/operator" ||
      pathname.startsWith("/operator/") ||
      pathname === "/logcom" ||
      pathname.startsWith("/logcom/");

    return isOperatorRole || isOperatorRoute;
  }, [user, location.pathname]);

  // Fetch DB Companies list for site dropdown filter
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/public/companies`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setDbCompanies(json.data.map((c: { name: string }) => c.name));
          }
        }
      } catch (e) {
        console.warn("Failed to load public companies", e);
      }
    }
    void fetchCompanies();
  }, []);

  // Fetch Orders list
  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const endpoint = isOperator
          ? `${API_BASE_URL}/api/v1/operator/orders`
          : `${API_BASE_URL}/api/v1/orders`;
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error("주문 목록을 불러오는데 실패했습니다.");
        }
        const json: ApiResponse<BackendOrderResponse[]> = await res.json();
        if (isMounted) {
          if (json.data && Array.isArray(json.data)) {
            const mapped = json.data.map(mapOrderResponse);
            setOrders(mapped);
          } else {
            setOrders([]);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        if (isMounted) {
          setLoadError(err.message || "주문 목록을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isOperator, reloadKey]);

  const orderCompanies = useMemo(() => {
    const combined = new Set([...dbCompanies, ...orders.map((o) => o.site)]);
    return Array.from(combined)
      .filter((s) => s && s !== "고객사 미지정")
      .sort((a, b) => a.localeCompare(b, "ko"));
  }, [dbCompanies, orders]);

  function handleSearch() {
    setApplied({ company, nameSearch, dateFrom, dateTo });
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setCompany("");
    setNameSearch("");
    setApplied({
      company: "",
      nameSearch: "",
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
    if (applied.nameSearch) {
      const term = applied.nameSearch.toLowerCase().trim();
      if (!order.name.toLowerCase().includes(term)) {
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

  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSubmittingShipment, setIsSubmittingShipment] = useState(false);

  async function handleConfirmStatusChange(request: OrderStatusChangeRequest) {
    if (!accessToken) return;

    setIsSubmittingStatus(true);
    try {
      const selectedOrders = orders.filter((o) => request.orderIds.includes(o.id));
      const endpointBase = isOperator ? `${API_BASE_URL}/api/v1/operator/orders` : `${API_BASE_URL}/api/v1/orders`;

      for (const order of selectedOrders) {
        const rawId = order.rawId;

        if (request.actionLabel === "영구 삭제" || request.targetStatus === "DELETE") {
          await fetch(`${endpointBase}/${rawId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else if (request.actionLabel === "주문 승인" || request.targetStatus === "APPROVED") {
          await fetch(`${endpointBase}/${rawId}/approve`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else if (request.actionLabel === "주문 반려" || request.targetStatus === "REJECTED") {
          await fetch(`${endpointBase}/${rawId}/reject`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: request.reason || "검수 반려" }),
          });
        } else if (request.targetStatus) {
          await fetch(`${endpointBase}/${rawId}/status`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: request.targetStatus }),
          });
        }
      }

      if (request.actionLabel === "영구 삭제" || request.targetStatus === "DELETE") {
        setOrders((prev) => prev.filter((o) => !request.orderIds.includes(o.id)));
      } else if (request.targetTab) {
        setOrders((prev) =>
          prev.map((o) =>
            request.orderIds.includes(o.id)
              ? { ...o, status: request.targetTab as OrderTab }
              : o
          )
        );
        setActiveTab(request.targetTab as OrderTab);
        setPage(1);
      }
    } catch (err) {
      console.error("Status change error:", err);
    } finally {
      setIsSubmittingStatus(false);
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

    setIsSubmittingShipment(true);
    try {
      const endpointBase = isOperator ? `${API_BASE_URL}/api/v1/operator/orders` : `${API_BASE_URL}/api/v1/orders`;
      await fetch(
        `${endpointBase}/${targetOrder.rawId}/status`,
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
      setIsSubmittingShipment(false);
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

  const actions = getTabActions(activeTab, isOperator);

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
        nameSearch={nameSearch}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onCompany={setCompany}
        onNameSearch={setNameSearch}
        onSearch={handleSearch}
        onReset={handleReset}
        companies={orderCompanies}
        showCompanyFilter={isOperator}
        companyLabel="회사명"
      />

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap border-b border-border">
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
                <th className="px-3 py-2.5">접수일자</th>
                <th className="px-3 py-2.5">고객사</th>
                <th className="px-3 py-2.5">이름</th>
                <th className="px-3 py-2.5">전화번호</th>
                <th className="px-3 py-2.5">재질/수량</th>
                <th className="px-3 py-2.5 text-right">가격</th>
                <th className="px-3 py-2.5 text-right">배송비</th>
                <th className="px-3 py-2.5">상태</th>
                <th className="px-3 py-2.5 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    주문 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
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
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(order.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {formatOrderDate(order.receivedAt)}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {order.site}
                      </td>
                      <td className="px-3 py-2 text-foreground">{order.name}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {order.phone}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {order.material} · {order.quantity.toLocaleString()}매
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">
                        {order.price}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {order.shippingFee}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <OrderActions
                          order={order}
                          onOpenDetail={handleOpenOrderDetail}
                          onOpenShipmentTracking={handleOpenShipmentTracking}
                          onPrint={handlePrintOrder}
                          onReorder={handleReorder}
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
        submitting={isSubmittingStatus}
        onClose={() => setStatusChangeRequest(null)}
        onConfirm={handleConfirmStatusChange}
      />

      <ShipmentTrackingModal
        open={Boolean(shipmentTrackingOrder)}
        order={shipmentTrackingOrder}
        submitting={isSubmittingShipment}
        onClose={() => setShipmentTrackingOrder(null)}
        onConfirm={handleConfirmShipmentTracking}
      />
    </div>
  );
}
