import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  ListFilter,
  Package,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { generateCardPrintPdf } from "@/shared/utils/generateCardPrintPdf";
import { exportOrdersExcel } from "@/shared/utils/exportOrdersExcel";
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
import { isSingleSidedTemplate } from "@/shared/constants/cardTemplates";
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
import { ExcelShipmentUploadModal } from "@/pages/orders/components/ExcelShipmentUploadModal";
import RejectReasonModal from "./components/RejectReasonModal";
import TemplateEditModal from "@/pages/templates/components/TemplateEditModal";
import ProofCheckModal from "@/pages/templates/components/ProofCheckModal";
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
import { getCarrierTrackingUrl } from "@/shared/utils/shipmentTracking";

const TAB_ICON_MAP: Record<OrderTab, React.ReactNode> = {
  전체: <ListFilter size={17} />,
  승인대기: <Clock size={17} />,
  승인완료: <CheckCircle2 size={17} />,
  인쇄중: <Printer size={17} />,
  발송완료: <Truck size={17} />,
  승인반려: <XCircle size={17} />,
  주문취소: <Ban size={17} />,
};

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
  isOperator?: boolean;
  showShipmentTracking?: boolean;
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
              scale={1.0}
            />
          </div>

          {!isSingleSidedTemplate(templateId) && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground">
                [뒷면]
              </span>
              <DynamicBusinessCardPreview
                templateId={templateId}
                cardData={parsed}
                isBack={true}
                scale={1.0}
              />
            </div>
          )}
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
  isOperator,
  showShipmentTracking = true,
}: OrderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {!isOperator && onReorder && (
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

      {isOperator && (
        <ActionIconButton label="명함 인쇄 / PDF" onClick={() => onPrint(order)}>
          <Printer size={13} />
        </ActionIconButton>
      )}

      <HoverCard openDelay={150} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label="명함 미리보기"
            title="명함 미리보기"
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground"
          >
            <Eye size={13} />
          </button>
        </HoverCardTrigger>

        <HoverCardContent align="end" side="left" sideOffset={12} className="w-[545px] max-h-[85vh] overflow-y-auto p-3.5 shadow-2xl">
          <BusinessCardPreview order={order} />
        </HoverCardContent>
      </HoverCard>

      {order.memo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              aria-label="주문 메모"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-500/35 bg-amber-500/10 text-amber-600 cursor-default"
            >
              <FileText size={13} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="max-w-xs break-words">
            <p className="font-semibold text-amber-300">주문 메모</p>
            <p className="mt-0.5 text-xs text-white">{order.memo}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isOperator && showShipmentTracking && (
        <ActionIconButton
          label="송장번호 입력/수정"
          onClick={() => onOpenShipmentTracking(order)}
        >
          <Truck size={13} />
        </ActionIconButton>
      )}
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

  const [reorderEditModalOpen, setReorderEditModalOpen] = useState(false);
  const [reorderProofModalOpen, setReorderProofModalOpen] = useState(false);
  const [selectedReorderOrder, setSelectedReorderOrder] = useState<Order | null>(null);
  const [pendingReorderCardData, setPendingReorderCardData] = useState<BusinessCardInputData | null>(null);
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false);

  const [dbCompanies, setDbCompanies] = useState<string[]>([]);

  function handleReorder(order: Order) {
    if (isOperator) return;
    let cardData: BusinessCardInputData | null = null;
    if (order.cardDataJson) {
      try {
        cardData = JSON.parse(order.cardDataJson);
      } catch (e) {
        console.error("Failed to parse cardDataJson", e);
      }
    }

    if (!cardData) {
      cardData = {
        front: {
          name: order.name || "홍길동",
          departmentOption: "직접입력",
          department: order.site || "",
          position1Option: "직접입력",
          position1: "",
          position2Option: "직접입력",
          position2: "",
          address: order.address || "",
          telephone: order.phone || "",
          fax: "",
          directTelephone: "",
          mobile: order.phone || "",
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
      };
    }

    setSelectedReorderOrder(order);
    setPendingReorderCardData(cardData);
    setReorderEditModalOpen(true);
  }

  function handlePrintOrder(order: Order) {
    generateCardPrintPdf({
      id: order.id,
      orderNo: order.id,
      recipientName: order.name,
      name: order.name,
      site: order.site,
      templateId: order.templateId || "T_CHEIL",
      cardDataJson: order.cardDataJson,
      createdAt: order.receivedAt,
    });
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

  const isEmployeeOnly = useMemo(() => {
    return (
      (user?.roles?.includes("ROLE_EMPLOYEE") ?? false) &&
      !user?.roles?.includes("ROLE_COMPANY_ADMIN") &&
      !user?.roles?.includes("ROLE_OPERATOR") &&
      !user?.roles?.includes("ROLE_SYSTEM_ADMIN")
    );
  }, [user?.roles]);

  const showShipmentTracking = true;

  const canApproveHighlight = useMemo(() => {
    const roles = user?.roles || [];
    return (
      roles.some(
        (r) =>
          r === "ROLE_OPERATOR" ||
          r === "OPERATOR" ||
          r === "ROLE_SYSTEM_ADMIN" ||
          r === "SYSTEM_ADMIN" ||
          r === "ROLE_COMPANY_ADMIN" ||
          r === "COMPANY_ADMIN",
      ) || isOperator
    );
  }, [user?.roles, isOperator]);

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

  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);

  function handleOpenOrderDetail(order: Order) {
    setSelectedOrder({
      id: order.rawId,
      orderNumber: order.id,
      companyName: order.site,
      product: "명함",
      material: order.material,
      quantity: order.quantity,
      memo: order.memo
        ? order.memo
        : order.rejectReason
          ? `반려 사유: ${order.rejectReason}`
          : order.trackingNumber
            ? `배송방법: ${order.carrierCode || "택배"} / 송장번호: ${order.trackingNumber}`
            : "",
      customerName: order.recipientName || order.name,
      phone: order.recipientPhone || order.phone,
      email: order.email || "",
      address: order.address || "",
      detailAddress: order.addressDetail || "",
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
    const selectedOrders = paged.filter((order) => selectedIds.has(order.id));
    const orderIds = selectedOrders.map((order) => order.id);
    const targetOrders = selectedOrders.map((order) => ({ id: order.id, name: order.name }));

    if (orderIds.length === 0) return;

    setStatusChangeRequest({
      actionLabel: action.label,
      orderIds,
      targetOrders,
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

  function handleExcelDownload() {
    const sitePrefix = companyCode || user?.companySiteCode || "order";
    const targetOrders =
      selectedIds.size > 0
        ? searched.filter((o) => selectedIds.has(o.id))
        : searched;

    if (targetOrders.length === 0) {
      alert("다운로드할 주문 내역이 없습니다.");
      return;
    }

    exportOrdersExcel(targetOrders, sitePrefix);
  }

  function handleTabChange(tab: OrderTab) {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds(new Set());
  }

  const actions = getTabActions(activeTab, isOperator, user?.roles);

  return (
    <div className="space-y-3 p-4 md:p-6">
      {/* 1. 상단 인라인 통합 헤더 (헤더 타이틀 + 검색 필터 + 액션 버튼 수평 정렬) */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2.5 shrink-0">
          <h1 className="text-base font-bold text-foreground md:text-lg">
            주문 관리
          </h1>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            총 {orders.length}건의 주문
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            embedded={true}
          />

          {isOperator && (
            <button
              type="button"
              onClick={() => setIsExcelUploadModalOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 shrink-0"
            >
              <FileSpreadsheet size={14} />
              <span>송장 엑셀 업로드</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExcelDownload}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary shrink-0"
          >
            <Download size={13} />
            <span>엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      {/* 2. 가로 탭 바 (아이콘 좌측 배치, 확대된 글씨 크기) */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-secondary/15 p-2.5 sm:p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {ORDER_TABS.map((tab) => {
              const count =
                tab === "전체"
                  ? orders.length
                  : orders.filter((order) => order.status === tab).length;

              const active = activeTab === tab;
              const IconComponent = TAB_ICON_MAP[tab];

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 transition-all duration-150 ${
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                      : "border-border/80 bg-background text-muted-foreground hover:border-border hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {/* 좌측 15px 아이콘 */}
                  <span className={`shrink-0 transition-transform duration-150 ${active ? "scale-110 text-primary" : "text-muted-foreground opacity-80"}`}>
                    {IconComponent}
                  </span>

                  {/* 중앙 확대된 글씨 라벨 */}
                  <span className={`text-sm md:text-[15px] font-extrabold whitespace-nowrap ${active ? "text-primary" : "text-foreground/90"}`}>
                    {tab}
                  </span>

                  {/* 우측 카운트 뱃지 */}
                  <span
                    className={`ml-0.5 flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2 text-xs">
            <span className="text-muted-foreground">
              {selectedCount > 0
                ? `${selectedCount}개 선택됨`
                : "처리할 항목을 선택하세요"}
            </span>

            <div className="flex gap-1.5">
              {actions.map((action) => {
                const isApproveBtn =
                  action.label === "주문 승인" || action.targetStatus === "APPROVED";
                const isFlashing =
                  isApproveBtn && canApproveHighlight && selectedCount > 0;

                let btnStyle =
                  "border border-border bg-background text-foreground hover:bg-secondary";

                if (isApproveBtn) {
                  btnStyle = `bg-blue-600 text-white font-semibold hover:bg-blue-700 ${
                    isFlashing ? "animate-pulse font-bold" : ""
                  }`;
                } else if (action.variant === "danger") {
                  btnStyle =
                    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100";
                } else if (action.variant === "primary") {
                  btnStyle = "bg-primary text-primary-foreground hover:opacity-90";
                }

                return (
                  <button
                    key={action.label}
                    disabled={selectedCount === 0}
                    onClick={() => handleOpenStatusChange(action)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${btnStyle}`}
                  >
                    {action.label}
                  </button>
                );
              })}
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
                <th className="px-3 py-2.5">접수일자</th>
                <th className="px-3 py-2.5">주문번호</th>
                <th className="px-3 py-2.5">고객사</th>
                <th className="px-3 py-2.5">이름</th>
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
                      className={`transition-colors hover:bg-secondary/30 ${isSelected ? "bg-secondary/40" : ""
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
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {formatOrderDate(order.receivedAt)}
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-foreground">
                        {order.id}
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
                      <td className="px-3 py-2">
                        {(() => {
                          const trackingUrl = (order.status === "발송완료" || (order.status as string) === "SHIPPED") && order.trackingNumber
                            ? getCarrierTrackingUrl(order.carrierCode, order.trackingNumber)
                            : null;
                          const isClickableStatus = order.status === "승인반려" || Boolean(trackingUrl);

                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.status === "승인반려") {
                                  setRejectModalOrder(order);
                                } else if (trackingUrl) {
                                  window.open(trackingUrl, "_blank", "noopener,noreferrer");
                                }
                              }}
                              className={
                                isClickableStatus
                                  ? "cursor-pointer rounded transition-transform active:scale-95"
                                  : "cursor-default"
                              }
                            >
                              <StatusBadge
                                status={order.status}
                                tooltip={
                                  order.status === "승인반려"
                                    ? order.rejectReason
                                      ? `클릭하여 반려 사유 팝업 확인: ${order.rejectReason}`
                                      : "클릭하여 반려 사유 팝업 확인"
                                    : trackingUrl
                                      ? `클릭하여 실시간 배송 추적 (${order.carrierCode || "택배"} : ${order.trackingNumber})`
                                      : undefined
                                }
                              />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <OrderActions
                          order={order}
                          onOpenDetail={handleOpenOrderDetail}
                          onOpenShipmentTracking={handleOpenShipmentTracking}
                          onPrint={handlePrintOrder}
                          onReorder={handleReorder}
                          isOperator={isOperator}
                          showShipmentTracking={showShipmentTracking}
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

      <RejectReasonModal
        open={Boolean(rejectModalOrder)}
        orderNo={rejectModalOrder?.id}
        customerName={rejectModalOrder?.name}
        reason={rejectModalOrder?.rejectReason}
        onClose={() => setRejectModalOrder(null)}
      />

      <TemplateEditModal
        key={selectedReorderOrder?.id ?? "reorder-template-edit"}
        open={reorderEditModalOpen}
        templateId={selectedReorderOrder?.templateId || "T_CHEIL"}
        initialCardData={pendingReorderCardData}
        onClose={() => {
          setReorderEditModalOpen(false);
          setReorderProofModalOpen(false);
          setSelectedReorderOrder(null);
          setPendingReorderCardData(null);
        }}
        onNext={(cardData) => {
          setPendingReorderCardData(cardData);
          setReorderEditModalOpen(false);
          setReorderProofModalOpen(true);
        }}
      />

      <ProofCheckModal
        open={reorderProofModalOpen}
        templateId={selectedReorderOrder?.templateId || "T_CHEIL"}
        cardData={pendingReorderCardData}
        onClose={() => {
          setReorderProofModalOpen(false);
          setSelectedReorderOrder(null);
          setPendingReorderCardData(null);
        }}
        onBack={() => {
          setReorderProofModalOpen(false);
          setReorderEditModalOpen(true);
        }}
        onConfirm={() => {
          if (!selectedReorderOrder || !pendingReorderCardData) return;

          const reorderData = {
            templateId: selectedReorderOrder.templateId || "T_CHEIL",
            cardData: pendingReorderCardData,
            recipientName: selectedReorderOrder.recipientName || selectedReorderOrder.name,
            recipientPhone: selectedReorderOrder.recipientPhone || selectedReorderOrder.phone,
            zipcode: selectedReorderOrder.zipcode || "",
            address: selectedReorderOrder.address || "",
            addressDetail: selectedReorderOrder.addressDetail || "",
            material: selectedReorderOrder.material || "일반용지 200g",
            quantity: selectedReorderOrder.quantity || 200,
          };

          const targetUrl = companyCode ? `/${companyCode}/orders/form` : `/admin/orders/form`;
          setReorderProofModalOpen(false);
          setReorderEditModalOpen(false);
          setSelectedReorderOrder(null);
          setPendingReorderCardData(null);

          navigate(targetUrl, { state: { reorderData } });
        }}
      />

      <ExcelShipmentUploadModal
        open={isExcelUploadModalOpen}
        token={accessToken}
        onClose={() => setIsExcelUploadModalOpen(false)}
        onSuccess={() => {
          setReloadKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
