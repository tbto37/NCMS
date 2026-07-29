import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireTenantAuth() {
  const { companyCode } = useParams<{ companyCode: string }>();
  const { isAuthed, user, logout } = useAuth();

  // 1. 미인증 상태 -> 로그인 페이지로 이동
  if (!isAuthed || !user) {
    return <Navigate to={companyCode ? `/${companyCode}/login` : "/login"} replace />;
  }

  // 2. 세션 검증 (현재 URL의 companyCode와 유저 소속 고객사 식별자 대조)
  // 유저가 운영자/시스템관리자이거나 타 고객사 세션인 경우 권한 차단 및 세션 만료
  const userSiteCode = user.companySiteCode?.toLowerCase();
  const targetSiteCode = companyCode?.toLowerCase();

  const isOperator = user.roles?.includes("ROLE_OPERATOR") || user.roles?.includes("ROLE_SYSTEM_ADMIN");

  const isMatchingTenant =
    !isOperator &&
    userSiteCode &&
    targetSiteCode &&
    (userSiteCode === targetSiteCode ||
      (targetSiteCode === "hanmi" && (userSiteCode.includes("hanmi") || user.companyName?.includes("한미"))) ||
      (targetSiteCode === "cheil" && (userSiteCode.includes("cheil") || user.companyName?.includes("제일"))) ||
      (targetSiteCode === "logcom" && (userSiteCode.includes("logcom") || user.companyName?.includes("로그컴"))));

  if (!isMatchingTenant) {
    // 세션 격리 위반 시 즉시 세션 만료 (로그아웃 처리) 및 해당 사이트 로그인 페이지로 이동
    console.warn(`[RequireTenantAuth] Session mismatch! User site: ${userSiteCode}, Target site: ${targetSiteCode}. Expiring session.`);
    logout();
    return <Navigate to={`/${companyCode}/login`} replace />;
  }

  return <Outlet />;
}
