import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Copy,
  FileText,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";

import TemplateEditModal from "./components/TemplateEditModal";
import ProofCheckModal from "./components/ProofCheckModal";

const templates = [
  {
    id: "TPL-001",
    name: "기본 회원 카드",
    category: "회원증",
    status: "사용중",
    updatedAt: "2026-07-21",
    usage: 128,
    fields: ["이름", "소속", "회원번호"],
    accent: "bg-accent",
  },
  {
    id: "TPL-002",
    name: "임직원 출입증",
    category: "출입증",
    status: "사용중",
    updatedAt: "2026-07-18",
    usage: 84,
    fields: ["사진", "부서", "QR"],
    accent: "bg-primary",
  },
  {
    id: "TPL-003",
    name: "이벤트 초대권",
    category: "이벤트",
    status: "검토중",
    updatedAt: "2026-07-12",
    usage: 36,
    fields: ["행사명", "좌석", "일정"],
    accent: "bg-chart-2",
  },
  {
    id: "TPL-004",
    name: "파트너 인증 카드",
    category: "파트너",
    status: "초안",
    updatedAt: "2026-07-08",
    usage: 0,
    fields: ["회사명", "등급", "유효기간"],
    accent: "bg-chart-5",
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { companyCode } = useParams<{ companyCode?: string }>();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            템플릿 관리
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">총 {templates.length}개 템플릿</p>
        </div>
        <button className="flex w-full items-center justify-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">
          <Plus size={12} />
          템플릿 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <article key={template.id} className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
            <div className="border-b border-border bg-secondary/30 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{template.id}</span>
                <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="템플릿 메뉴">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <div className="flex h-36 items-center justify-center rounded border border-border bg-card">
                <div className="h-24 w-36 rounded border border-border bg-background p-2 shadow-sm">
                  <div className={`mb-2 h-2 w-10 rounded ${template.accent}`} />
                  <div className="space-y-1.5">
                    <div className="h-2 w-24 rounded bg-secondary" />
                    <div className="h-2 w-16 rounded bg-secondary" />
                    <div className="mt-4 grid grid-cols-3 gap-1.5">
                      <div className="h-8 rounded bg-secondary" />
                      <div className="col-span-2 space-y-1">
                        <div className="h-1.5 rounded bg-secondary" />
                        <div className="h-1.5 w-10 rounded bg-secondary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-foreground">{template.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{template.category}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {template.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span key={field} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {field}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">수정일</div>
                  <div className="mt-0.5 font-mono text-foreground">{template.updatedAt}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">사용량</div>
                  <div className="mt-0.5 font-mono text-foreground">{template.usage.toLocaleString()}건</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded border border-border px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
                >
                  <SquarePen size={12} />
                  편집
                </button>
                <button className="flex items-center justify-center rounded border border-border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="템플릿 복사">
                  <Copy size={12} />
                </button>
                <button className="flex items-center justify-center rounded border border-border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="디자인 설정">
                  <Palette size={12} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <FileText size={14} className="shrink-0" />
        템플릿 카드는 실제 API 연결 전까지 화면 검토용 목업 데이터를 사용합니다.
      </div>

      <TemplateEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onNext={() => {
          setProofModalOpen(true);
        }}
      />

      <ProofCheckModal
        open={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        onBack={() => {
          setProofModalOpen(false);
        }}
        onConfirm={() => {
          setProofModalOpen(false);
          setEditModalOpen(false);
          navigate(companyCode ? `/${companyCode}/orders/new` : "/orders/new");
        }}
      />
    </div>
  );
}
