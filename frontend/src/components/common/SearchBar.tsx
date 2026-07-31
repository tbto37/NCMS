import { Search } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export type SearchBarProps = {
  dateFrom: string;
  dateTo: string;
  company: string;
  nameSearch: string;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  onCompany: (v: string) => void;
  onNameSearch: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  companies?: string[];
  showDateFilter?: boolean;
  showCompanyFilter?: boolean;
  companyLabel?: string;
  nameSearchLabel?: string;
  nameSearchPlaceholder?: string;
  embedded?: boolean;
};

export function SearchBar({
  dateFrom,
  dateTo,
  company,
  nameSearch,
  onDateFrom,
  onDateTo,
  onCompany,
  onNameSearch,
  onSearch,
  onReset,
  companies = [],
  showDateFilter = true,
  showCompanyFilter = true,
  companyLabel = "회사명",
  nameSearchLabel = "주문자 이름",
  nameSearchPlaceholder = "주문번호, 이름 검색",
  embedded = false,
}: SearchBarProps) {
  return (
    <div className={embedded ? "" : "rounded-lg border border-border bg-card p-4"}>
      <div className={`flex flex-wrap gap-2.5 ${embedded ? "items-center" : "items-end"}`}>
        {/* 날짜 범위 검색 필터 */}
        {showDateFilter && (
          <div className="min-w-[210px] flex-1">
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFrom={onDateFrom}
              onDateTo={onDateTo}
              label="날짜"
              hideLabel={embedded}
            />
          </div>
        )}

        {/* 회사명 검색 필터 */}
        {showCompanyFilter && (
          <div className="min-w-[140px] flex-1">
            {!embedded && (
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {companyLabel}
              </label>
            )}
            <select
              value={company}
              onChange={(e) => onCompany(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="">전체 회사</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 이름/아이디 검색어 필터 */}
        <div className="min-w-[160px] flex-1">
          {!embedded && (
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {nameSearchLabel}
            </label>
          )}
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => onNameSearch(e.target.value)}
            placeholder={nameSearchPlaceholder}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* 버튼 영역 (한 줄 배치 우측 결합) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Search size={13} />
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
