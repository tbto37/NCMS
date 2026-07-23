import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireAuth() {
  const { isAuthed } = useAuth();
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
}
