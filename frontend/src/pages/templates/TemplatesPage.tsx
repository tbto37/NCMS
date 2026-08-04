import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  Copy,
  FileText,
  ImageOff,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  SquarePen,
} from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { API_BASE_URL } from "@/shared/constants/api";
import type {
  BusinessCardInputData,
  OrderFormLocationState,
} from "@/shared/types/businessCard";
import TemplateEditModal from "./components/TemplateEditModal";
import ProofCheckModal from "./components/ProofCheckModal";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: {
    message?: string;
  };
}

interface TemplateApiResponse {
  id: number | string;
  name: string;
  previewFrontUrl?: string | null;
  previewBackUrl?: string | null;
  status?: string | null;
}

interface TemplateCardData {
  id: number | string;
  name: string;
  previewFrontUrl: string | null;
  previewBackUrl: string | null;
  status: string;
  category: string;
  accent: string;
}

const MOCK_CARD_DETAILS = [
  {
    category: "제일엔지니어링 종합건축사 사무소용",
    accent: "bg-accent",
  },
  {
    category: "제일엔지니어링 용",
    accent: "bg-primary",
  },
  {
    category: "이벤트",
    accent: "bg-chart-2",
  },
  {
    category: "파트너",
    accent: "bg-chart-5",
  },
] as const;

function getStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "사용중";
    case "INACTIVE":
      return "사용중지";
    case "REVIEW":
    case "REVIEWING":
      return "검토중";
    case "DRAFT":
      return "초안";
    default:
      return status || "상태 미정";
  }
}

function mapTemplateResponse(
  template: TemplateApiResponse,
  index: number,
): TemplateCardData {
  const mockDetail = MOCK_CARD_DETAILS[index % MOCK_CARD_DETAILS.length];

  let previewFrontUrl = template.previewFrontUrl ?? null;
  const nameStr = (template.name || "").toLowerCase();
  const idStr = String(template.id || "").toLowerCase();

  // 한미글로벌 템플릿의 경우 템플릿 목록 카드 썸네일로 hanmi_template.jpg 사용
  if (idStr === "3" || idStr.includes("hanmi") || nameStr.includes("한미")) {
    previewFrontUrl = "/hanmi/hanmi_template.jpg";
  }

  return {
    id: template.id,
    name: template.name,
    previewFrontUrl: previewFrontUrl,
    previewBackUrl: template.previewBackUrl ?? null,
    status: getStatusLabel(template.status),
    category: mockDetail.category,
    accent: mockDetail.accent,
  };
}

function getErrorMessage(
  body: ApiResponse<unknown> | null,
): string {
  return (
    body?.message ??
    body?.error?.message ??
    "템플릿 목록을 불러오지 못했습니다."
  );
}

function resolvePreviewUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  if (/^(https?:|data:|blob:|\/)/i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}/${url}`;
}

function TemplatePreview({
  template,
}: {
  template: TemplateCardData;
}) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const previewUrl = resolvePreviewUrl(template.previewFrontUrl);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [previewUrl]);

  if (previewUrl && !imageLoadFailed) {
    return (
      <div className="flex h-36 items-center justify-center overflow-hidden rounded border border-border bg-card p-3">
        <img
          src={previewUrl}
          alt={`${template.name} 앞면 미리보기`}
          onError={() => setImageLoadFailed(true)}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
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
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { accessToken } = useAuth();

  const [apiTemplates, setApiTemplates] = useState<TemplateApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCardData | null>(null);
  const [pendingCardData, setPendingCardData] = useState<BusinessCardInputData | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setApiTemplates([]);
      setLoading(false);
      setLoadError("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      return;
    }

    const abortController = new AbortController();

    async function fetchTemplates() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/company/templates`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: abortController.signal,
          },
        );

        const body = (await response
          .json()
          .catch(() => null)) as ApiResponse<TemplateApiResponse[]> | null;

        if (!response.ok) {
          throw new Error(getErrorMessage(body));
        }

        const responseTemplates = body?.data;

        if (!Array.isArray(responseTemplates)) {
          throw new Error("템플릿 목록 응답 형식이 올바르지 않습니다.");
        }

        setApiTemplates(responseTemplates);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setApiTemplates([]);
        setLoadError(
          error instanceof Error
            ? error.message
            : "템플릿 목록을 불러오지 못했습니다.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchTemplates();

    return () => abortController.abort();
  }, [accessToken, reloadKey]);

  const templates = useMemo(
    () => apiTemplates.map(mapTemplateResponse),
    [apiTemplates],
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground md:text-xl">
            템플릿 관리
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            총 {loading ? "-" : templates.length}개 템플릿
          </p>
        </div>
        {/* <button className="flex w-full items-center justify-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">
          <Plus size={12} />
          템플릿 추가
        </button> */}
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border bg-card">
          <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
            <RefreshCw size={20} className="animate-spin" />
            템플릿 목록을 불러오는 중입니다.
          </div>
        </div>
      ) : loadError ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border bg-card px-4">
          <div className="flex max-w-md flex-col items-center text-center">
            <AlertCircle size={26} className="text-destructive" />
            <p className="mt-3 text-sm font-medium text-foreground">
              템플릿 목록을 불러오지 못했습니다.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 flex items-center gap-1.5 rounded border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RefreshCw size={13} />
              다시 불러오기
            </button>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border bg-card px-4">
          <div className="flex flex-col items-center text-center">
            <ImageOff size={26} className="text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              배정된 템플릿이 없습니다.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              현재 로그인한 고객사에 연결된 활성 템플릿이 없습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {templates.map((template) => (
            <article
              key={template.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="border-b border-border bg-secondary/30 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {template.id}
                  </span>
                  {/* <button
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="템플릿 메뉴"
                  >
                    <MoreHorizontal size={14} />
                  </button> */}
                </div>

                <TemplatePreview template={template} />
              </div>

              <div className="space-y-3 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-foreground">
                      {template.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {template.category}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {template.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPendingCardData(null);
                      setEditModalOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded border border-border px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
                  >
                    <SquarePen size={12} />
                    편집
                  </button>
                  {/* <button
                    className="flex items-center justify-center rounded border border-border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="템플릿 복사"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    className="flex items-center justify-center rounded border border-border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="디자인 설정"
                  >
                    <Palette size={12} />
                  </button> */}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <TemplateEditModal
        key={selectedTemplate?.id ?? "template-edit"}
        open={editModalOpen}
        templateId={selectedTemplate?.id}
        initialCardData={pendingCardData}
        onClose={() => {
          setEditModalOpen(false);
          setProofModalOpen(false);
          setSelectedTemplate(null);
          setPendingCardData(null);
        }}
        onNext={(cardData) => {
          setPendingCardData(cardData);
          setEditModalOpen(false);
          setProofModalOpen(true);
        }}
      />

      <ProofCheckModal
        open={proofModalOpen}
        templateId={selectedTemplate?.id}
        cardData={pendingCardData}
        onClose={() => setProofModalOpen(false)}
        onBack={() => {
          setProofModalOpen(false);
          setEditModalOpen(true);
        }}
        onConfirm={() => {
          if (!companyCode || !selectedTemplate || !pendingCardData) {
            return;
          }

          const locationState: OrderFormLocationState = {
            orderDraft: {
              template: {
                id: selectedTemplate.id,
                name: selectedTemplate.name,
                previewFrontUrl: selectedTemplate.previewFrontUrl,
                previewBackUrl: selectedTemplate.previewBackUrl,
              },
              front: pendingCardData.front,
              back: pendingCardData.back,
            },
          };

          setProofModalOpen(false);
          setEditModalOpen(false);
          navigate(`/${companyCode}/orders/form`, {
            state: locationState,
          });
        }}
      />
    </div>
  );
}
