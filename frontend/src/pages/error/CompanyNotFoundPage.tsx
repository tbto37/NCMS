import { Link } from "react-router";

export default function CompanyNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-xl font-bold text-destructive">
          !
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">
          등록되지 않은 고객사 사이트입니다
        </h1>
        <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
          입력하신 URL의 고객사 코드가 시스템 DB에 존재하지 않거나 접근할 수 없습니다.<br />
          올바른 고객사 URL 전용 경로를 다시 확인해 주세요.
        </p>
        <Link
          to="/logcom/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          로그컴 관리자 사이트로 이동
        </Link>
      </div>
    </div>
  );
}
