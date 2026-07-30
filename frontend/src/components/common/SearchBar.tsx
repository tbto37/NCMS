import { Search } from "lucide-react";

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
  showCompanyFilter?: boolean;
  companyLabel?: string;
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
  showCompanyFilter = true,
  companyLabel = "회사명",
}: SearchBarProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${
          showCompanyFilter ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {/* 시작일 */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            시작일
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFrom(e.target.value)}
            className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* 종료일 */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            종료일
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateTo(e.target.value)}
            className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* 회사명 (로그컴 어드민 전용) */}
        {showCompanyFilter && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {companyLabel}
            </label>
            <select
              value={company}
              onChange={(e) => onCompany(e.target.value)}
              className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
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

        {/* 이름 검색어 */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            주문자 이름
          </label>
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => onNameSearch(e.target.value)}
            placeholder="이름 검색어 입력"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full rounded border border-border bg-secondary px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Search size={11} />
          검색
        </button>
      </div>
    </div>
  );
}
