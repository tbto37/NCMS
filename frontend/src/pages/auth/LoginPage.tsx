import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Package, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginPage() {
  const { companyCode } = useParams<{ companyCode?: string }>();
  const isTenantLogin = Boolean(companyCode);

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id.trim() || !pw) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const loginResult = await login(id.trim(), pw, remember);

      if (isTenantLogin) {
        navigate(`/${companyCode}/templates`, { replace: true });
      } else if (loginResult.roles?.includes("ROLE_OPERATOR")) {
        navigate("/operator/orders", { replace: true });
      } else if (loginResult.companyName?.includes("한미")) {
        navigate("/hanmi/templates", { replace: true });
      } else if (loginResult.companyName?.includes("제일")) {
        navigate("/cheil/templates", { replace: true });
      } else if (loginResult.companyName?.includes("투비더원")) {
        navigate("/tobetheone/templates", { replace: true });
      } else {
        navigate("/admin/orders", { replace: true });
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Package size={18} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {isTenantLogin ? `${companyCode?.toUpperCase()} 로그인` : "로그컴 관리자 로그인"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isTenantLogin ? "고객사 명함 관리 시스템" : "로그컴 백오피스 시스템"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="아이디 입력"
              className="w-full px-3 py-2.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-3 py-2.5 pr-9 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer rounded border-border accent-primary"
            />

            <span className="text-xs text-muted-foreground">
              로그인 유지
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity mt-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          문의: <span className="text-foreground">admin@example.com</span>
        </p>
      </div>
    </div>
  );
}
