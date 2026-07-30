import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireAdminAuth() {
  const { isAuthed, user, logout } = useAuth();

  if (!isAuthed || !user) {
    return <Navigate to="/login" replace />;
  }

  const isOperator = user.roles?.includes("ROLE_OPERATOR");

  if (!isOperator) {
    // 고객사 일반 유저가 로그컴 관리자/운영자 영역 진입 시 세션 만료 및 로그인으로 강제 이동
    console.warn(`[RequireAdminAuth] Customer user attempted to access admin route. Expiring session.`);
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
