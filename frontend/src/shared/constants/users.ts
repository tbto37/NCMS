export const USER_TABS = ["전체", "개발팀", "디자인팀", "마케팅팀", "영업팀", "운영팀"] as const;
export type UserTab = typeof USER_TABS[number];

export const USER_TAB_ACTIONS: Record<UserTab, { label: string; variant: "primary" | "danger" | "ghost" }[]> = {
  전체:      [],
  개발팀:    [{ label: "권한 변경", variant: "primary" }, { label: "계정 비활성화", variant: "danger" }],
  디자인팀:  [{ label: "권한 변경", variant: "primary" }, { label: "계정 비활성화", variant: "danger" }],
  마케팅팀:  [{ label: "권한 변경", variant: "primary" }, { label: "계정 비활성화", variant: "danger" }],
  영업팀:    [{ label: "권한 변경", variant: "primary" }, { label: "계정 비활성화", variant: "danger" }],
  운영팀:    [{ label: "권한 변경", variant: "primary" }, { label: "계정 비활성화", variant: "danger" }],
};

export const USER_FILTER_FIELDS = [
  { value: "name", label: "이름" },
  { value: "email", label: "이메일" },
  { value: "role", label: "역할" },
];

export const USER_COMPANIES = ["주식회사 예시", "테크코리아", "디지털솔루션", "한국IT"];

export const extUsers = [
  { id: 1, name: "김민준", email: "minjun.kim@email.com", role: "관리자", status: "활성", dept: "개발팀", company: "주식회사 예시", joined: "2024-03-15", orders: 142 },
  { id: 2, name: "이서연", email: "seoyeon.lee@email.com", role: "편집자", status: "활성", dept: "디자인팀", company: "테크코리아", joined: "2024-05-22", orders: 87 },
  { id: 3, name: "박지훈", email: "jihun.park@email.com", role: "뷰어", status: "비활성", dept: "마케팅팀", company: "주식회사 예시", joined: "2024-01-08", orders: 23 },
  { id: 4, name: "최수아", email: "sua.choi@email.com", role: "편집자", status: "활성", dept: "영업팀", company: "디지털솔루션", joined: "2024-07-01", orders: 56 },
  { id: 5, name: "정우진", email: "woojin.jung@email.com", role: "뷰어", status: "보류", dept: "운영팀", company: "한국IT", joined: "2024-06-14", orders: 12 },
  { id: 6, name: "강예은", email: "yeeun.kang@email.com", role: "관리자", status: "활성", dept: "개발팀", company: "주식회사 예시", joined: "2023-11-30", orders: 204 },
  { id: 7, name: "조현서", email: "hyunseo.jo@email.com", role: "뷰어", status: "활성", dept: "디자인팀", company: "테크코리아", joined: "2025-01-12", orders: 34 },
  { id: 8, name: "한도윤", email: "doyun.han@email.com", role: "편집자", status: "활성", dept: "마케팅팀", company: "디지털솔루션", joined: "2025-02-20", orders: 19 },
  { id: 9, name: "오지민", email: "jimin.oh@email.com", role: "뷰어", status: "활성", dept: "영업팀", company: "한국IT", joined: "2025-03-05", orders: 7 },
  { id: 10, name: "조현원", email: "jimin.oh@email.com", role: "뷰어", status: "활성", dept: "영업팀", company: "한국IT", joined: "2025-03-05", orders: 0 },
  { id: 11, name: "이가영", email: "jimin.oh@email.com", role: "뷰어", status: "활성", dept: "영업팀", company: "한국IT", joined: "2025-03-05", orders: 0 },
];
