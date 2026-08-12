import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Pencil, X } from "lucide-react";

export interface MemberEditData {
  id: number | string;
  loginId?: string;
  password?: string;
  email?: string;
  department?: string;
}

interface MemberEditModalProps {
  open: boolean;
  member: MemberEditData | null;
  onClose: () => void;
  onSubmit?: (member: MemberEditData) => Promise<void> | void;
}

export default function MemberEditModal({
  open,
  member,
  onClose,
  onSubmit,
}: MemberEditModalProps) {
  const [form, setForm] = useState<MemberEditData>({
    id: "",
    loginId: "",
    password: "",
    email: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !member) return;

    setForm({
      id: member.id ?? "",
      loginId: member.loginId ?? String(member.id ?? ""),
      password: member.password ?? "",
      email: member.email ?? "",
      department: member.department ?? "",
    });
    setSubmitting(false);
  }, [open, member]);

  useEffect(() => {
    if (!open) return;

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

  const handleChange = (
    field: keyof MemberEditData,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      await onSubmit?.(form);
    } catch (error) {
      console.error("회원 정보 수정 처리 중 오류:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (!submitting && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-edit-title"
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pencil size={17} />
            </span>

            <div className="min-w-0">
              <h2
                id="member-edit-title"
                className="truncate text-base font-semibold text-foreground"
              >
                회원 정보 수정
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                회원의 기본 정보를 수정합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label="회원 수정 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            {/* ID (Readonly) */}
            <div>
              <label
                htmlFor="member-edit-id"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                ID
              </label>

              <input
                id="member-edit-id"
                type="text"
                value={form.loginId || form.id}
                readOnly
                tabIndex={-1}
                className="h-10 w-full rounded-md border border-border bg-secondary/80 px-3 text-xs font-mono text-muted-foreground cursor-not-allowed outline-none select-none"
              />
            </div>

            {/* 비밀번호 (Editable) */}
            <div>
              <label
                htmlFor="member-edit-password"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                비밀번호
              </label>

              <input
                id="member-edit-password"
                type="text"
                value={form.password ?? ""}
                disabled={submitting}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="변경할 비밀번호를 입력하세요"
                className="h-10 w-full rounded-md border border-border bg-secondary/45 px-3 text-xs font-mono text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/15 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* 이메일 (Editable) */}
            <div>
              <label
                htmlFor="member-edit-email"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                이메일
              </label>

              <input
                id="member-edit-email"
                type="email"
                value={form.email ?? ""}
                disabled={submitting}
                onChange={(event) =>
                  handleChange("email", event.target.value)
                }
                placeholder="이메일 주소를 입력하세요"
                className="h-10 w-full rounded-md border border-border bg-secondary/45 px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/15 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* 부서 (Readonly) */}
            <div>
              <label
                htmlFor="member-edit-department"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                부서
              </label>

              <input
                id="member-edit-department"
                type="text"
                value={form.department ?? ""}
                readOnly
                tabIndex={-1}
                className="h-10 w-full rounded-md border border-border bg-secondary/80 px-3 text-xs text-muted-foreground cursor-not-allowed outline-none select-none"
              />
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-4">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              disabled={submitting}
              className="h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>수정 중...</span>
                </>
              ) : (
                <span>수정</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
