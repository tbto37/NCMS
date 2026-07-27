export interface MemberApiResponse {
  id: string;
  companyId: string | null;
  departmentId: string | null;
  departmentName: string | null;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];

  /*
   * 현재 backend MemberResponse에는 companyName이 없습니다.
   * 추후 backend 응답에 추가되더라도 프론트를 다시 고치지 않도록
   * 선택 필드로만 열어둡니다.
   */
  companyName?: string | null;
}

export interface Member {
  id: string;
  companyId: string;
  company: string;
  departmentId: string;
  dept: string;
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: {
    message?: string;
  };
}

export const MEMBER_DISPLAY_PASSWORD = "test";

export const MEMBER_FILTER_FIELDS = [
  {
    value: "loginId",
    label: "ID",
  },
  {
    value: "password",
    label: "패스워드",
  },
] as const;

export const MEMBER_TAB_ACTIONS: {
  label: string;
  variant: "primary" | "danger" | "ghost";
}[] = [
  {
    label: "권한 변경",
    variant: "primary",
  },
  {
    label: "계정 비활성화",
    variant: "danger",
  },
];

export function mapMemberResponse(member: MemberApiResponse): Member {
  return {
    id: member.id,
    companyId: member.companyId ?? "",

    /*
     * 현재 API에는 회사명이 없으므로 companyId를 표시합니다.
     * backend에 companyName이 추가되면 자동으로 회사명이 우선 표시됩니다.
     */
    company:
      member.companyName?.trim() ||
      member.companyId ||
      "회사 미지정",

    departmentId: member.departmentId ?? "",
    dept: member.departmentName?.trim() || "부서 미지정",
    loginId: member.username,
    password: MEMBER_DISPLAY_PASSWORD,
    name: member.name,
    email: member.email ?? "",
    phone: member.phone ?? "",
    status: member.status,
    roles: member.roles ?? [],
  };
}
