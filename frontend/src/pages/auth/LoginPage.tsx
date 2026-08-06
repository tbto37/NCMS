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
  const { login, logout } = useAuth();
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

      const loginResult = await login(id.trim(), pw, remember, companyCode || "");
      const userSiteCode = loginResult.companySiteCode?.toLowerCase();
      const targetSiteCode = companyCode?.toLowerCase();
      const isOperator = loginResult.roles?.includes("ROLE_OPERATOR");

      if (isTenantLogin) {
        // 고객사 어드민/로그인 페이지 접속 시 (/:companyCode/login):
        const isMatch =
          isOperator ||
          (userSiteCode &&
            targetSiteCode &&
            (userSiteCode === targetSiteCode ||
              userSiteCode.includes(targetSiteCode) ||
              targetSiteCode.includes(userSiteCode)));

        if (!isMatch) {
          logout();
          setError(`현재 페이지는 ${companyCode?.toUpperCase()} 전용 사이트입니다. 해당 계정은 접근 권한이 없습니다.`);
          return;
        }

        if (isOperator) {
          navigate("/operator/orders", { replace: true });
        } else {
          navigate(`/${companyCode}/templates`, { replace: true });
        }
      } else {
        // 로그컴 대표 어드민 로그인 페이지 접속 시 (/login):
        if (!isOperator) {
          logout();
          const targetUrl = userSiteCode ? `/${userSiteCode}/login` : "/login";
          setError(`로그컴 어드민 전용 로그인 페이지입니다. 소속 고객사 전용 주소(${targetUrl})로 접속해 주세요.`);
          return;
        }

        navigate("/operator/orders", { replace: true });
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

  const code = companyCode?.toLowerCase();
  const tenantLogo = code === "cheil" ? "/logos/cheil_logo.png" : code === "hanmi" ? "/logos/hanmi_logo.png" : "";

  const tenantTitle = !isTenantLogin
    ? "로그컴 관리자 로그인"
    : code === "cheil"
    ? "제일엔지니어링 로그인"
    : code === "hanmi"
    ? "한미글로벌 로그인"
    : `${companyCode?.toUpperCase()} 로그인`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {tenantLogo ? (
            <div className="h-14 flex items-center justify-center mb-4 px-2">
              <img
                src={tenantLogo}
                alt={`${companyCode?.toUpperCase()} 로고`}
                className="h-full max-w-[220px] object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Package size={18} className="text-primary-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-foreground">
            {tenantTitle}
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
