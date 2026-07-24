import { Outlet, Link } from "react-router";
import { useTenant } from "@/shared/hooks/useTenant";

export function TenantLayout() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mr-2" />
        고객사 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Branding Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="h-8 max-w-[160px] object-contain"
            />
          ) : (
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{ color: "var(--brand-primary-color, #0052CC)" }}
            >
              {tenant?.name || "NCMS"}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
            임직원 명함 시스템
          </span>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
          <Link
            to={`/${tenant?.siteCode}/templates`}
            className="hover:text-slate-900 transition-colors"
          >
            명함 신청
          </Link>
          <Link
            to={`/${tenant?.siteCode}/orders`}
            className="hover:text-slate-900 transition-colors"
          >
            주문 내역
          </Link>
          <Link
            to={`/${tenant?.siteCode}/company/members`}
            className="hover:text-slate-900 transition-colors text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md"
          >
            기업 관리자
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
