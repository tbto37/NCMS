import { Link, useNavigate } from "react-router";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full items-center justify-center p-4 md:p-6">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-center md:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
          <AlertTriangle size={22} />
        </div>

        <p className="mb-2 font-mono text-xs text-muted-foreground">ERROR</p>
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          페이지를 표시할 수 없습니다
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
          요청한 화면이 없거나 일시적인 문제가 발생했습니다. 주소를 확인하거나 대시보드로 이동해 다시 시도하세요.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft size={13} />
            이전으로
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw size={13} />
            새로고침
          </button>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-1.5 rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Home size={13} />
            대시보드
          </Link>
        </div>
      </section>
    </div>
  );
}
