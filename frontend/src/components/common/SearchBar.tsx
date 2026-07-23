import { Search } from "lucide-react";

export type SearchBarProps = {
  dateFrom: string;
  dateTo: string;
  company: string;
  filterField: string;
  filterValue: string;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  onCompany: (v: string) => void;
  onFilterField: (v: string) => void;
  onFilterValue: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  filterFields: { value: string; label: string }[];
  companies: string[];
};

export function SearchBar({
                            dateFrom, dateTo, company, filterField, filterValue,
                            onDateFrom, onDateTo, onCompany, onFilterField, onFilterValue,
                            onSearch, onReset, filterFields, companies,
                          }: SearchBarProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 날짜 from */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">시작일</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFrom(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {/* 날짜 to */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">종료일</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateTo(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {/* 회사명 */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">회사명</label>
          <select
            value={company}
            onChange={(e) => onCompany(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">전체</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* 필터 항목 Select + Input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">검색 항목</label>
          <div className="flex gap-1.5">
            <select
              value={filterField}
              onChange={(e) => onFilterField(e.target.value)}
              className="w-28 shrink-0 px-2 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {filterFields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => onFilterValue(e.target.value)}
              placeholder="검색어 입력"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs border border-border rounded hover:bg-secondary transition-colors"
        >
          초기화
        </button>
        <button
          onClick={onSearch}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity"
        >
          <Search size={11} />
          검색
        </button>
      </div>
    </div>
  );
}
