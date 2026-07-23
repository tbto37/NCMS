import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PAGE_SIZE } from "@/shared/constants/pagination";
import {
  USER_TABS,
  type UserTab,
  USER_TAB_ACTIONS,
  USER_FILTER_FIELDS,
  USER_COMPANIES,
  extUsers,
} from "@/shared/constants/users";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>("전체");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [company, setCompany] = useState("");
  const [filterField, setFilterField] = useState("name");
  const [filterValue, setFilterValue] = useState("");
  const [applied, setApplied] = useState({ company: "", filterField: "name", filterValue: "", dateFrom: "", dateTo: "" });

  function handleSearch() {
    setApplied({ company, filterField, filterValue, dateFrom, dateTo });
    setPage(1);
    setSelectedIds(new Set());
  }
  function handleReset() {
    setDateFrom(""); setDateTo(""); setCompany(""); setFilterField("name"); setFilterValue("");
    setApplied({ company: "", filterField: "name", filterValue: "", dateFrom: "", dateTo: "" });
    setPage(1); setSelectedIds(new Set());
  }

  const tabFiltered = activeTab === "전체" ? extUsers : extUsers.filter((u) => u.dept === activeTab);
  const searched = tabFiltered.filter((u) => {
    if (applied.company && u.company !== applied.company) return false;
    if (applied.filterValue) {
      const val = applied.filterValue.toLowerCase();
      const field = applied.filterField as keyof typeof u;
      if (!String(u[field]).toLowerCase().includes(val)) return false;
    }
    if (applied.dateFrom && u.joined < applied.dateFrom) return false;
    if (applied.dateTo && u.joined > applied.dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paged = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paged.length > 0 && paged.every((u) => selectedIds.has(u.id));
  const selectedCount = paged.filter((u) => selectedIds.has(u.id)).length;

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) paged.forEach((u) => next.delete(u.id));
      else paged.forEach((u) => next.add(u.id));
      return next;
    });
  }
  function toggleOne(id: number) {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function handleTabChange(tab: UserTab) { setActiveTab(tab); setPage(1); setSelectedIds(new Set()); }

  const actions = USER_TAB_ACTIONS[activeTab];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>사용자 관리</h1>
          <p className="text-xs text-muted-foreground mt-0.5">총 {extUsers.length}명</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
          <Plus size={11} />
          사용자 추가
        </button>
      </div>

      <SearchBar
        dateFrom={dateFrom} dateTo={dateTo} company={company}
        filterField={filterField} filterValue={filterValue}
        onDateFrom={setDateFrom} onDateTo={setDateTo} onCompany={setCompany}
        onFilterField={setFilterField} onFilterValue={setFilterValue}
        onSearch={handleSearch} onReset={handleReset}
        filterFields={USER_FILTER_FIELDS} companies={USER_COMPANIES}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border">
          {USER_TABS.map((tab) => {
            const count = tab === "전체" ? extUsers.length : extUsers.filter((u) => u.dept === tab).length;
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
          <div className="flex h-[344px] flex-col items-center justify-center text-muted-foreground">
            <Users size={32} className="mb-3 opacity-30" />
            <p className="text-xs">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden h-[344px] overflow-auto md:block">
              <table className="w-full">
                <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-2.5 w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-border accent-primary" />
                  </th>
                  {["이름 / 이메일", "부서", "역할", "상태", "회사", "가입일", "주문 수"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider">{h}</th>
                  ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-border">
                {paged.map((user) => {
                  const checked = selectedIds.has(user.id);
                  return (
                    <tr key={user.id} onClick={() => toggleOne(user.id)}
                        className={`hover:bg-secondary/40 transition-colors cursor-pointer ${checked ? "bg-secondary/60" : ""}`}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={checked} onChange={() => toggleOne(user.id)} className="rounded border-border accent-primary" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">{user.name[0]}</div>
                          <div>
                            <div className="text-xs font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{user.dept}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded">{user.role}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{user.company}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{user.joined}</td>
                      <td className="px-4 py-3 text-xs font-mono font-medium">{user.orders}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="h-[344px] divide-y divide-border overflow-y-auto md:hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/40">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-border accent-primary" />
                <span className="text-xs text-muted-foreground">전체 선택 ({paged.length}건)</span>
              </div>
              {paged.map((user) => {
                const checked = selectedIds.has(user.id);
                return (
                  <div key={user.id} onClick={() => toggleOne(user.id)}
                       className={`flex items-start gap-3 px-4 py-3 transition-colors ${checked ? "bg-secondary/60" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(user.id)}
                           className="mt-0.5 rounded border-border accent-primary shrink-0" onClick={(e) => e.stopPropagation()} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground">{user.name}</span>
                        <StatusBadge status={user.status} />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{user.dept} · {user.company} · {user.joined}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action bar */}
            {actions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                <span className="text-xs text-muted-foreground">
                  {selectedCount > 0 ? `${selectedCount}건 선택됨` : "항목을 선택하세요"}
                </span>
                <div className="flex items-center gap-2">
                  {actions.map((action) => (
                    <button key={action.label} disabled={selectedCount === 0}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              action.variant === "primary" ? "bg-primary text-primary-foreground hover:opacity-90"
                                : action.variant === "danger" ? "bg-red-500 text-white hover:bg-red-600"
                                  : "border border-border text-foreground hover:bg-secondary"}`}>
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
    </div>
  );
}
