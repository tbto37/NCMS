import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { TenantProvider } from "./providers/TenantProvider";
import { RequireAuth } from "./guards/RequireAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const TemplatesPage = lazy(() => import("@/pages/templates/TemplatesPage"));
const MembersPage = lazy(() => import("@/pages/members/MembersPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));
const OrderFormPage = lazy(() => import("@/pages/orders/OrderFormPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ErrorPage = lazy(() => import("@/pages/error/ErrorPage"));
const CompanyNotFoundPage = lazy(() => import("@/pages/error/CompanyNotFoundPage"));

import { RequireTenantAuth } from "./guards/RequireTenantAuth";
import { RequireAdminAuth } from "./guards/RequireAdminAuth";

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh] text-xs text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

import { useParams } from "react-router";

function TenantIndexRedirect() {
  const { companyCode } = useParams<{ companyCode?: string }>();
  const code = companyCode?.toLowerCase();
  const isLogcom = code === "logcom" || code === "operator" || code === "admin";
  return <Navigate to={isLogcom ? "orders" : "templates"} replace />;
}

function TenantWrapper() {
  return (
    <TenantProvider>
      <Outlet />
    </TenantProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Dynamic Customer Path Routes: /:companyCode */}
            <Route path="/:companyCode" element={<TenantWrapper />}>
              <Route index element={<TenantIndexRedirect />} />
              <Route path="login" element={<LoginPage />} />
              <Route element={<RequireTenantAuth />}>
                <Route element={<AdminLayout />}>
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/form" element={<OrderFormPage />} />
                  <Route path="members" element={<MembersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Logcom Internal Operator Routes: /operator */}
            <Route path="/operator" element={<RequireAdminAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="members" element={<MembersPage />} />
              </Route>
            </Route>

            {/* Logcom System Admin Routes: /admin */}
            <Route path="/admin" element={<RequireAdminAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/form" element={<OrderFormPage />} />
                <Route path="members" element={<MembersPage />} />
              </Route>
            </Route>

            {/* Default & Fallback Routes (URL 뒤 고객사 코드가 없으면 로그컴으로 인식) */}
            <Route path="/" element={<Navigate to="/logcom/login" replace />} />
            <Route path="/login" element={<Navigate to="/logcom/login" replace />} />
            <Route path="/admin/login" element={<Navigate to="/logcom/login" replace />} />
            <Route path="/error/company-not-found" element={<CompanyNotFoundPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/logcom/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
