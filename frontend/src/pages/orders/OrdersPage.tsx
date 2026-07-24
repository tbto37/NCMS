import { useState } from "react";
import { Download, Eye, FileDown, Package, ReceiptText, Truck } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import OrderDetailModal, {
  type OrderDetailData,
} from "./components/OrderDetailModal";
import OrderStatusChangeConfirmModal, {
  type OrderStatusChangeRequest,
} from "./components/OrderStatusChangeConfirmModal";
import { PAGE_SIZE } from "@/shared/constants/pagination";
import {
  ORDER_TABS,
  type OrderTab,
  TAB_ACTIONS,
  ORDER_FILTER_FIELDS,
  ORDER_COMPANIES,
  allOrders,
} from "@/shared/constants/orders";


type Order = (typeof allOrders)[number];

interface ActionIconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
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
          <p className="mt-0.5 text-[11px] text-muted-foreground">{order.customer} · {order.id}</p>
        </div>
        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">앞면</span>
      </div>

      <div className="aspect-[1.75/1] overflow-hidden rounded border border-border bg-white shadow-sm">
        <div className="grid h-[calc(100%-5px)] grid-cols-[35%_65%]">
          <div className="flex flex-col justify-between border-r border-slate-200 p-3">
            <div className="flex items-end gap-0.5">
              <span className="text-lg font-black tracking-[-0.08em] text-[#06418f]">CHEIL</span>
              <span className="mb-0.5 h-3 w-1 bg-[#55b936]" />
            </div>
            <span className="text-[6px] italic text-slate-500">“Smiling Technology”</span>
          </div>

          <div className="p-3 text-slate-600">
            <p className="text-[9px] font-semibold text-slate-900">{order.customer}</p>
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

interface OrderActionsProps {
  order: Order;
  onOpenDetail: (order: Order) => void;
}

function OrderActions({ order, onOpenDetail }: OrderActionsProps) {
  const handleAction = (action: string) => {
    // 실제 상세 페이지 이동, PDF 다운로드, 배송 API 연결 시 이 부분을 교체하면 됩니다.
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

      <ActionIconButton label="배송 추적" onClick={() => handleAction("배송 추적")}>
        <Truck size={13} />
      </ActionIconButton>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>("전체");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [company, setCompany] = useState("");
  const [filterField, setFilterField] = useState("id");
  const [filterValue, setFilterValue] = useState("");
  const [applied, setApplied] = useState({ company: "", filterField: "id", filterValue: "", dateFrom: "", dateTo: "" });

  function handleSearch() {
    setApplied({ company, filterField, filterValue, dateFrom, dateTo });
    setPage(1); setSelectedIds(new Set());
  }
  function handleReset() {
    setDateFrom(""); setDateTo(""); setCompany(""); setFilterField("id"); setFilterValue("");
    setApplied({ company: "", filterField: "id", filterValue: "", dateFrom: "", dateTo: "" });
    setPage(1); setSelectedIds(new Set());
  }

  const tabFiltered = activeTab === "전체" ? allOrders : allOrders.filter((o) => o.status === activeTab);
  const searched = tabFiltered.filter((o) => {
    if (applied.filterValue) {
      const val = applied.filterValue.toLowerCase();
      const field = applied.filterField as keyof typeof o;
      if (!String(o[field]).toLowerCase().includes(val)) return false;
    }
    if (applied.dateFrom && o.date < applied.dateFrom) return false;
    if (applied.dateTo && o.date > applied.dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paged = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paged.length > 0 && paged.every((o) => selectedIds.has(o.id));
  const selectedCount = paged.filter((o) => selectedIds.has(o.id)).length;

  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [statusChangeRequest, setStatusChangeRequest] =
    useState<OrderStatusChangeRequest | null>(null);

  function handleOpenOrderDetail(order: Order) {
    setSelectedOrder({
      id: order.id,
      orderNumber: order.id,
      department: "제일엔지니어링",
      product: order.product,
      material: "휘라레 216g",
      quantity: 2000,
      memo: "",
      customerName: order.customer,
      phone: "02-3498-2600",
      email: "youremail@email.com",
      address: "06779 서울시 서초구 방배천로 22-6",
      detailAddress: "9층",
      status: order.status,
      createdAt: order.date,
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

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) paged.forEach((o) => next.delete(o.id));
      else paged.forEach((o) => next.add(o.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function handleTabChange(tab: OrderTab) { setActiveTab(tab); setPage(1); setSelectedIds(new Set()); }

  const actions = TAB_ACTIONS[activeTab];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>주문 관리</h1>
          <p className="text-xs text-muted-foreground mt-0.5">총 {allOrders.length}건</p>
        </div>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-xs rounded hover:bg-secondary transition-colors">
          <Download size={11} />
          <span className="hidden sm:inline">내보내기</span>
        </button>
      </div>

      <SearchBar
        dateFrom={dateFrom} dateTo={dateTo} company={company}
        filterField={filterField} filterValue={filterValue}
        onDateFrom={setDateFrom} onDateTo={setDateTo} onCompany={setCompany}
        onFilterField={setFilterField} onFilterValue={setFilterValue}
        onSearch={handleSearch} onReset={handleReset}
        filterFields={ORDER_FILTER_FIELDS} companies={ORDER_COMPANIES}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {ORDER_TABS.map((tab) => {
            const count = tab === "전체" ? allOrders.length : allOrders.filter((o) => o.status === tab).length;
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => handleTabChange(tab)}
                      className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab}
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{count}</span>
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
              <table className="w-full min-w-[1180px] table-fixed">
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-2.5 w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-border accent-primary" />
                  </th>
                  {["주문번호", "고객", "상품", "카테고리", "금액", "상태", "주문일", "액션"].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-xs font-medium text-muted-foreground tracking-wider ${h === "액션" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-border">
                {paged.map((order) => {
                  const checked = selectedIds.has(order.id);
                  return (
                    <tr key={order.id} onClick={() => toggleOne(order.id)}
                        className={`hover:bg-secondary/40 transition-colors cursor-pointer ${checked ? "bg-secondary/60" : ""}`}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={checked} onChange={() => toggleOne(order.id)} className="rounded border-border accent-primary" />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{order.customer}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{order.product}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded">{order.category}</span></td>
                      <td className="px-4 py-3 text-xs font-medium font-mono">₩{order.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{order.date}</td>
                      <td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>
                        <OrderActions order={order} onOpenDetail={handleOpenOrderDetail} />
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            <div className="h-[510px] divide-y divide-border overflow-y-auto md:hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/40">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-border accent-primary" />
                <span className="text-xs text-muted-foreground">전체 선택 ({paged.length}건)</span>
              </div>
              {paged.map((order) => {
                const checked = selectedIds.has(order.id);
                return (
                  <div key={order.id} onClick={() => toggleOne(order.id)}
                       className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${checked ? "bg-secondary/60" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(order.id)}
                           className="mt-0.5 rounded border-border accent-primary shrink-0" onClick={(e) => e.stopPropagation()} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-xs font-medium text-foreground truncate">{order.product}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{order.customer} · {order.date}</span>
                        <span className="text-xs font-medium font-mono">₩{order.amount.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 border-t border-border pt-2" onClick={(event) => event.stopPropagation()}>
                        <OrderActions order={order} onOpenDetail={handleOpenOrderDetail} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {actions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
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
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
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

            <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); setSelectedIds(new Set()); }} />
          </>
        )}
      </div>

      <OrderDetailModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <OrderStatusChangeConfirmModal
        open={statusChangeRequest !== null}
        request={statusChangeRequest}
        onClose={() => setStatusChangeRequest(null)}
        onConfirm={(request) => {
          console.log("주문 상태 변경:", request);

          setStatusChangeRequest(null);
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
