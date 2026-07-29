import { useEffect, useState, ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import { TenantContext, TenantInfo } from "./TenantContext";
import { API_BASE_URL } from "@/shared/constants/api";

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyCode) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // DB site_code 검증 API 호출
    fetch(`${API_BASE_URL}/api/v1/public/companies/${companyCode}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Company not found: ${companyCode}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Invalid response content for company: ${companyCode}`);
        }
        return res.json();
      })
      .then((body) => {
        if (!isMounted) return;

        if (!body.data || !body.data.siteCode) {
          throw new Error(`Company data invalid: ${companyCode}`);
        }

        const tenantData: TenantInfo = {
          id: body.data.id || companyCode,
          siteCode: body.data.siteCode,
          name: body.data.name || companyCode.toUpperCase(),
          primaryColor: body.data.primaryColor || "#0052CC",
          status: body.data.status || "ACTIVE",
        };

        setTenant(tenantData);

        // Dynamic CSS variable for brand color
        if (tenantData.primaryColor) {
          document.documentElement.style.setProperty(
            "--brand-primary-color",
            tenantData.primaryColor
          );
        }

        // Set page title
        document.title = `${tenantData.name} - NCMS 명함 관리 시스템`;
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[TenantProvider] Invalid site_code. Blocking entry:", companyCode, err);
        setError("Invalid company site code");
        setIsLoading(false);
        // DB site_code와 일치하지 않는 경우 화면 진입을 아예 차단하고 에러 페이지로 강제 이동
        navigate("/error/company-not-found", { replace: true });
      });

    return () => {
      isMounted = false;
    };
  }, [companyCode, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
          <span className="text-xs text-muted-foreground">고객사 사이트 정보를 확인하는 중입니다...</span>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return null;
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
