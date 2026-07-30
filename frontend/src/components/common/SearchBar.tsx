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
  nameSearchPlaceholder = "이름 검색어 입력",
}: SearchBarProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 날짜 범위 검색 필터 */}
        {showDateFilter && (
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFrom={onDateFrom}
            onDateTo={onDateTo}
            label="날짜"
          />
        )}

        {/* 회사명 검색 필터 */}
        {showCompanyFilter && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {companyLabel}
            </label>
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
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            {nameSearchLabel}
          </label>
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => onNameSearch(e.target.value)}
            placeholder={nameSearchPlaceholder}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Search size={13} />
          검색
        </button>
      </div>
    </div>
  );
}
