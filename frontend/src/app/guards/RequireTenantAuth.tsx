import { Navigate, Outlet, useParams } from "react-router";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireTenantAuth() {
  const { companyCode } = useParams<{ companyCode: string }>();
  const { isAuthed, user, logout } = useAuth();

  // 1. 미인증 상태 -> 해당 고객사 로그인 페이지로 이동
  if (!isAuthed || !user) {
    return <Navigate to={companyCode ? `/${companyCode}/login` : "/login"} replace />;
  }

  const isOperator = user.roles?.includes("ROLE_OPERATOR");

  // 2. 로그컴 어드민 계정(ROLE_OPERATOR)은 고객사 어드민 페이지 진입 불가 -> 세션 자동 종료 및 이동
  if (isOperator) {
    console.warn(`[RequireTenantAuth] Operator user attempted to access customer site /${companyCode}. Expiring session for tenant isolation.`);
    logout();
    return <Navigate to={`/${companyCode}/login`} replace />;
  }

  // 3. 세션 검증 (현재 URL의 companyCode와 유저 소속 고객사 siteCode 대조)
  const userSiteCode = user.companySiteCode?.toLowerCase();
  const targetSiteCode = companyCode?.toLowerCase();

  const isMatchingTenant =
    userSiteCode &&
    targetSiteCode &&
    (userSiteCode === targetSiteCode ||
      userSiteCode.includes(targetSiteCode) ||
      targetSiteCode.includes(userSiteCode));

  if (!isMatchingTenant) {
    // 세션 격리 위반 시 세션 만료 및 해당 고객사 로그인 페이지로 이동
    console.warn(`[RequireTenantAuth] Session mismatch! User site: ${userSiteCode}, Target site: ${targetSiteCode}. Expiring session.`);
    logout();
    return <Navigate to={`/${companyCode}/login`} replace />;
  }

  return <Outlet />;
}
