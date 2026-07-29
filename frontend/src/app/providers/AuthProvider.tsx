import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "@/shared/constants/api";

export type AuthUser = {
  memberId: string;
  username: string;
  name: string;
  companyId: string | null;
  companyName: string | null;
  companySiteCode: string | null;
  roles: string[];
};

export type LoginResult = AuthUser & {
  accessToken: string;
  tokenType: string;
};

type StoredAuth = {
  accessToken: string;
  user: AuthUser;
};

type AuthContextValue = {
  isAuthed: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  login: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<LoginResult>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "ncms-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredAuth(): StoredAuth | null {
  const value =
    localStorage.getItem(AUTH_STORAGE_KEY) ??
    sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => getStoredAuth());

  async function login(
    username: string,
    password: string,
    remember: boolean,
  ): Promise<LoginResult> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        body?.message ??
        body?.error?.message ??
        body?.data?.message ??
        "로그인에 실패했습니다.";

      throw new Error(message);
    }

    // ApiResponse.success(...) 구조를 고려해 data를 우선 사용
    const loginResult: LoginResult = body?.data ?? body;

    if (!loginResult?.accessToken) {
      throw new Error("로그인 응답에 accessToken이 없습니다.");
    }

    const user: AuthUser = {
      memberId: loginResult.memberId,
      username: loginResult.username,
      name: loginResult.name,
      companyId: loginResult.companyId,
      companyName: loginResult.companyName ?? null,
      companySiteCode: loginResult.companySiteCode ?? null,
      roles: loginResult.roles ?? [],
    };

    const storedAuth: StoredAuth = {
      accessToken: loginResult.accessToken,
      user,
    };

    // 이전 로그인 정보 제거
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedAuth));

    setAuth(storedAuth);

    return loginResult;
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthed: Boolean(auth?.accessToken),
      accessToken: auth?.accessToken ?? null,
      user: auth?.user ?? null,
      login,
      logout,
    }),
    [auth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
