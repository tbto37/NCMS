import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2, TriangleAlert, X } from "lucide-react";

export interface MemberDeleteData {
  id: string | number;
  name: string;
  department?: string;
  company?: string;
}

interface MemberDeleteConfirmModalProps {
  open: boolean;
  member: MemberDeleteData | null;
  onClose: () => void;
  onConfirm?: (member: MemberDeleteData) => Promise<void> | void;
}

export default function MemberDeleteConfirmModal({
                                                   open,
                                                   member,
                                                   onClose,
                                                   onConfirm,
                                                 }: MemberDeleteConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open || !member) return null;

  const handleConfirm = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await onConfirm?.(member);
    } catch (error) {
      console.error("회원 삭제 처리 중 오류:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (!submitting && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="member-delete-title"
        aria-describedby="member-delete-description"
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <Trash2 size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="member-delete-title"
                className="truncate text-base font-semibold text-foreground"
              >
                회원 삭제
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                선택한 회원을 시스템에서 삭제합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label="회원 삭제 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-6">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-4">
            <TriangleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>
              <p
                id="member-delete-description"
                className="text-sm font-semibold text-foreground"
              >
                정말 삭제하시겠습니까?
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                삭제한 회원 정보는 복구할 수 없습니다. 회원 정보를 다시 한번
                확인한 후 삭제해 주세요.
              </p>
            </div>
          </div>

          <dl className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[100px_minmax(0,1fr)] border-b border-border px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">회원 ID</dt>
              <dd className="truncate font-mono text-xs font-medium text-foreground">
                {member.id}
              </dd>
            </div>

            <div className="grid grid-cols-[100px_minmax(0,1fr)] border-b border-border px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">이름</dt>
              <dd className="truncate text-xs font-medium text-foreground">
                {member.name}
              </dd>
            </div>

            <div className="grid grid-cols-[100px_minmax(0,1fr)] border-b border-border px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">부서</dt>
              <dd className="truncate text-xs text-foreground">
                {member.department || "-"}
              </dd>
            </div>

            <div className="grid grid-cols-[100px_minmax(0,1fr)] px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">회사</dt>
              <dd className="truncate text-xs text-foreground">
                {member.company || "-"}
              </dd>
            </div>
          </dl>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex h-10 items-center gap-2 rounded-md bg-red-500 px-4 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>삭제</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
