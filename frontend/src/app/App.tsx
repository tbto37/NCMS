import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { TenantProvider } from "./providers/TenantProvider";
import { RequireAuth } from "./guards/RequireAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { TenantLayout } from "@/components/layout/TenantLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));
const OrderFormPage = lazy(() => import("@/pages/orders/OrderFormPage"));
const TemplatesPage = lazy(() => import("@/pages/templates/TemplatesPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ErrorPage = lazy(() => import("@/pages/error/ErrorPage"));
const CompanyNotFoundPage = lazy(() => import("@/pages/error/CompanyNotFoundPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh] text-xs text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
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
              <Route path="login" element={<LoginPage />} />
              <Route element={<TenantLayout />}>
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/new" element={<OrderFormPage />} />
                <Route path="company/members" element={<UsersPage />} />
                <Route path="company/departments" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* Logcom Internal Operator Routes: /operator */}
            <Route path="/operator" element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="production" element={<DashboardPage />} />
                <Route path="shipments" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* Logcom System Admin Routes: /admin */}
            <Route path="/admin" element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="companies" replace />} />
                <Route path="companies" element={<DashboardPage />} />
                <Route path="members" element={<UsersPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="products" element={<SettingsPage />} />
                <Route path="audit-logs" element={<AnalyticsPage />} />
              </Route>
            </Route>

            {/* Default & Fallback Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/error/company-not-found" element={<CompanyNotFoundPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
