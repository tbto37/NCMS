import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";

export interface MemberEditData {
  id: string;
  password?: string;
  department?: string;
}

interface MemberEditModalProps {
  open: boolean;
  member: MemberEditData | null;
  onClose: () => void;
  onSubmit?: (member: MemberEditData) => void;
}

export default function MemberEditModal({
                                          open,
                                          member,
                                          onClose,
                                          onSubmit,
                                        }: MemberEditModalProps) {
  const [form, setForm] = useState<MemberEditData>({
    id: "",
    password: "",
    department: "",
  });

  useEffect(() => {
    if (!open || !member) return;

    setForm({
      id: member.id ?? "",
      password: member.password ?? "",
      department: member.department ?? "",
    });
  }, [open, member]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(form);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
            onClick={onClose}
            aria-label="회원 수정 창 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label
                htmlFor="member-edit-id"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                ID
              </label>

              <input
                id="member-edit-id"
                type="text"
                value={form.id}
                onChange={(event) => handleChange("id", event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-secondary/45 px-3 text-xs text-foreground outline-none transition focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/15"
              />
            </div>

            <div>
              <label
                htmlFor="member-edit-password"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                비밀번호
              </label>

              <input
                id="member-edit-password"
                type="text"
                value={form.password ?? ""}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="변경할 비밀번호를 입력하세요"
                className="h-10 w-full rounded-md border border-border bg-secondary/45 px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/15"
              />
            </div>

            <div>
              <label
                htmlFor="member-edit-department"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                부서
              </label>

              <input
                id="member-edit-department"
                type="text"
                value={form.department ?? ""}
                onChange={(event) =>
                  handleChange("department", event.target.value)
                }
                placeholder="부서를 입력하세요"
                className="h-10 w-full rounded-md border border-border bg-secondary/45 px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/15"
              />
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              취소
            </button>

            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              수정
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
