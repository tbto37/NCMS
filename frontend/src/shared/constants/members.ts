export interface MemberApiResponse {
  id: number | string;
  companyId: number | string | null;
  companyName: string | null;
  departmentId: number | string | null;
  departmentName: string | null;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
}

export interface Member {
  id: number | string;
  companyId: number | string;
  company: string;
  departmentId: number | string;
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
    company: member.companyName?.trim() || "회사 미지정",
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
