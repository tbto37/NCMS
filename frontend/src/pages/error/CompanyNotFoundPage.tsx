import { Link } from "react-router";

export default function CompanyNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          고객사 사이트를 찾을 수 없습니다
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          요청하신 고객사 코드의 사이트가 존재하지 않거나 현재 서비스가 비활성화되어 있습니다. URL 경로를 다시 확인해주세요.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}
