import { Navigate, Outlet, useParams } from "react-router";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireMemberManageAuth() {
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { isAuthed, user } = useAuth();

  if (!isAuthed || !user) {
    return <Navigate to={companyCode ? `/${companyCode}/login` : "/login"} replace />;
  }

  const isEmployeeOnly =
    user.roles?.includes("ROLE_EMPLOYEE") &&
    !user.roles?.includes("ROLE_COMPANY_ADMIN") &&
    !user.roles?.includes("ROLE_OPERATOR") &&
    !user.roles?.includes("ROLE_SYSTEM_ADMIN");

  if (isEmployeeOnly) {
    console.warn(
      `[RequireMemberManageAuth] Employee user attempted to access member management route. Access denied. Redirecting to orders.`,
    );
    const fallbackPath = companyCode ? `/${companyCode}/orders` : "/login";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
