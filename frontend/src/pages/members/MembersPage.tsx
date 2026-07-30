import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/app/providers/AuthProvider";
import { PAGE_SIZE } from "@/shared/constants/pagination";
import {
  MEMBER_FILTER_FIELDS,
  mapMemberResponse,
  type ApiResponse,
  type Member,
  type MemberApiResponse,
} from "@/shared/constants/members";
import MemberEditModal, {
  type MemberEditData,
} from "./components/MemberEditModal";
import MemberDeleteConfirmModal, {
  type MemberDeleteData,
} from "./components/MemberDeleteConfirmModal";

import { API_BASE_URL } from "@/shared/constants/api";

function getErrorMessage(body: ApiResponse<unknown> | null): string {
  return (
    body?.message ??
    body?.error?.message ??
    "회원 목록을 불러오지 못했습니다."
  );
}

interface MemberActionButtonProps {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MemberActionButton({
                              label,
                              danger = false,
                              onClick,
                              children,
                            }: MemberActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background transition-colors ${
            danger
              ? "border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              : "border-border text-muted-foreground hover:border-primary/30 hover:bg-secondary hover:text-foreground"
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface MemberActionsProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

function MemberActions({
                         member,
                         onEdit,
                         onDelete,
                       }: MemberActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <MemberActionButton
        label="회원 수정"
        onClick={() => onEdit(member)}
      >
        <Pencil size={13} />
      </MemberActionButton>

      <MemberActionButton
        label="회원 삭제"
        danger
        onClick={() => onDelete(member)}
      >
        <Trash2 size={13} />
      </MemberActionButton>
    </div>
  );
}

export default function MembersPage() {
  const { accessToken, user } = useAuth();
  const isOperator = user?.roles?.includes("ROLE_OPERATOR") ?? false;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [activeTab, setActiveTab] = useState("전체");
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set(),
  );
  const [page, setPage] = useState(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [company, setCompany] = useState("");
  const [filterField, setFilterField] = useState("loginId");
  const [filterValue, setFilterValue] = useState("");
  const [searchNotice, setSearchNotice] = useState("");

  const [applied, setApplied] = useState({
    company: "",
    filterField: "loginId",
    filterValue: "",
  });

  const [selectedMember, setSelectedMember] =
    useState<MemberEditData | null>(null);

  const [deleteMember, setDeleteMember] =
    useState<MemberDeleteData | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setMembers([]);
      setLoading(false);
      setLoadError("로그인 정보가 없습니다.");
      return;
    }

    const abortController = new AbortController();

    async function fetchMembers() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/company/members`,
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
          .catch(() => null)) as ApiResponse<MemberApiResponse[]> | null;

        if (!response.ok) {
          throw new Error(getErrorMessage(body));
        }

        const responseMembers = body?.data;

        if (!Array.isArray(responseMembers)) {
          throw new Error("회원 목록 응답 형식이 올바르지 않습니다.");
        }

        setMembers(responseMembers.map(mapMemberResponse));
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setMembers([]);
        setLoadError(
          error instanceof Error
            ? error.message
            : "회원 목록을 불러오지 못했습니다.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchMembers();

    return () => abortController.abort();
  }, [accessToken, reloadKey]);

  const memberTabs = useMemo(() => {
    const tabNames = Array.from(
      new Set(
        members.map((member) =>
          isOperator
            ? member.company
            : member.dept,
        ),
      ),
    ).sort((a, b) => a.localeCompare(b, "ko"));

    return ["전체", ...tabNames];
  }, [members, isOperator]);

  const memberCompanies = useMemo(() => {
    return Array.from(
      new Set(members.map((member) => member.company)),
    ).sort((a, b) => a.localeCompare(b, "ko"));
  }, [members]);

  useEffect(() => {
    if (!memberTabs.includes(activeTab)) {
      setActiveTab("전체");
    }
  }, [activeTab, memberTabs]);

  function handleEditMember(member: Member) {
    setSelectedMember({
      id: member.loginId,
      password: member.password,
      department: member.dept,
    });
  }

  function handleDeleteMember(member: Member) {
    setDeleteMember({
      id: member.id,
      name: member.name,
      department: member.dept,
      company: member.company,
    });
  }

  function handleSearch() {
    setApplied({
      company,
      filterField,
      filterValue,
    });

    setSearchNotice(
      dateFrom || dateTo
        ? "현재 회원 조회 API에는 가입일이 없어 날짜 조건은 적용되지 않습니다."
        : "",
    );

    setPage(1);
    setSelectedIds(new Set());
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setCompany("");
    setFilterField("loginId");
    setFilterValue("");
    setSearchNotice("");

    setApplied({
      company: "",
      filterField: "loginId",
      filterValue: "",
    });

    setPage(1);
    setSelectedIds(new Set());
  }

  const tabFiltered =
    activeTab === "전체"
      ? members
      : members.filter((member) =>
        isOperator
          ? member.company === activeTab
          : member.dept === activeTab,
      );

  const searched = tabFiltered.filter((member) => {
    if (
      applied.company &&
      member.company !== applied.company
    ) {
      return false;
    }

    if (applied.filterValue) {
      const value = applied.filterValue.toLowerCase();
      const field = applied.filterField as "loginId" | "password";

      if (
        !String(member[field])
          .toLowerCase()
          .includes(value)
      ) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(searched.length / PAGE_SIZE),
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paged = searched.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const allSelected =
    paged.length > 0 &&
    paged.every((member) =>
      selectedIds.has(member.id),
    );

  const selectedCount = paged.filter((member) =>
    selectedIds.has(member.id),
  ).length;

  function toggleAll() {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (allSelected) {
        paged.forEach((member) =>
          next.delete(member.id),
        );
      } else {
        paged.forEach((member) =>
          next.add(member.id),
        );
      }

      return next;
    });
  }

  function toggleOne(id: number | string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      next.has(id)
        ? next.delete(id)
        : next.add(id);

      return next;
    });
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground md:text-xl">
            회원 관리
          </h1>

          <p className="mt-0.5 text-xs text-muted-foreground">
            총 {members.length}명
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus size={11} />
          회원 추가
        </button>
      </div>

      <SearchBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        company={company}
        nameSearch={filterValue}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onCompany={setCompany}
        onNameSearch={setFilterValue}
        onSearch={handleSearch}
        onReset={handleReset}
        companies={memberCompanies}
        showDateFilter={false}
        showCompanyFilter={false}
        nameSearchLabel="아이디"
        nameSearchPlaceholder="아이디 검색어 입력"
      />

      {searchNotice && (
        <p className="text-xs text-amber-600">
          {searchNotice}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex overflow-x-auto border-b border-border">
          {memberTabs.map((tab) => {
            const count =
              tab === "전체"
                ? members.length
                : members.filter((member) =>
                  isOperator
                    ? member.company === tab
                    : member.dept === tab,
                ).length;

            const active = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors md:px-4 ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}

                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-xs ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex h-[510px] flex-col items-center justify-center text-muted-foreground">
            <RefreshCw
              size={28}
              className="mb-3 animate-spin opacity-50"
            />

            <p className="text-xs">
              회원 목록을 불러오는 중입니다.
            </p>
          </div>
        ) : loadError ? (
          <div className="flex h-[510px] flex-col items-center justify-center px-4 text-center text-muted-foreground">
            <Users
              size={32}
              className="mb-3 opacity-30"
            />

            <p className="text-xs text-red-500">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((value) => value + 1)
              }
              className="mt-3 flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
            >
              <RefreshCw size={12} />
              다시 불러오기
            </button>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex h-[510px] flex-col items-center justify-center text-muted-foreground">
            <Users
              size={32}
              className="mb-3 opacity-30"
            />

            <p className="text-xs">
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden h-[510px] overflow-auto md:block">
              <table className="w-full min-w-[760px] table-fixed">
                <colgroup>
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "31%" }} />
                  <col style={{ width: "31%" }} />
                  <col style={{ width: "96px" }} />
                </colgroup>

                <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-0 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="mx-auto block rounded border-border accent-primary"
                    />
                  </th>

                  {[
                    "회사명",
                    "ID",
                    "패스워드",
                    "액션",
                  ].map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-2.5 text-xs font-medium tracking-wider text-muted-foreground ${
                        header === "액션"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                </thead>

                <tbody className="divide-y divide-border">
                {paged.map((member) => {
                  const checked = selectedIds.has(
                    member.id,
                  );

                  return (
                    <tr
                      key={member.id}
                      onClick={() =>
                        toggleOne(member.id)
                      }
                      className={`cursor-pointer transition-colors hover:bg-secondary/40 ${
                        checked
                          ? "bg-secondary/60"
                          : ""
                      }`}
                    >
                      <td
                        className="px-0 py-3 text-center"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleOne(member.id)
                          }
                          className="mx-auto block rounded border-border accent-primary"
                        />
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {member.company}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {member.loginId}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {member.password}
                      </td>

                      <td
                        className="px-4 py-2"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <MemberActions
                          member={member}
                          onEdit={handleEditMember}
                          onDelete={
                            handleDeleteMember
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            <div className="h-[510px] divide-y divide-border overflow-y-auto md:hidden">
              <div className="flex items-center gap-3 bg-secondary/40 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary"
                />

                <span className="text-xs text-muted-foreground">
                  전체 선택 ({paged.length}건)
                </span>
              </div>

              {paged.map((member) => {
                const checked = selectedIds.has(
                  member.id,
                );

                return (
                  <div
                    key={member.id}
                    onClick={() =>
                      toggleOne(member.id)
                    }
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      checked
                        ? "bg-secondary/60"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleOne(member.id)
                      }
                      className="mt-0.5 shrink-0 rounded border-border accent-primary"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-foreground">
                          {member.company}
                        </span>

                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {member.loginId}
                        </span>
                      </div>

                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        패스워드: {member.password}
                      </div>

                      <div
                        className="mt-2 border-t border-border pt-2"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <MemberActions
                          member={member}
                          onEdit={handleEditMember}
                          onDelete={
                            handleDeleteMember
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={(nextPage) => {
                setPage(nextPage);
                setSelectedIds(new Set());
              }}
            />
          </>
        )}
      </div>

      <MemberEditModal
        open={selectedMember !== null}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSubmit={(updatedMember) => {
          console.log(
            "수정할 회원:",
            updatedMember,
          );

          setSelectedMember(null);
        }}
      />

      <MemberDeleteConfirmModal
        open={deleteMember !== null}
        member={deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={(member) => {
          console.log("삭제할 회원:", member);
          setDeleteMember(null);
        }}
      />
    </div>
  );
}
