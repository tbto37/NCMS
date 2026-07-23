import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { RequireAuth } from "./guards/RequireAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));
const TemplatesPage = lazy(() => import("@/pages/templates/TemplatesPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ErrorPage = lazy(() => import("@/pages/error/ErrorPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh] text-xs text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
