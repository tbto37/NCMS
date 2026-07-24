import { useEffect, useState, ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import { TenantContext, TenantInfo } from "./TenantContext";

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

    fetch(`/api/v1/public/companies/${companyCode}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Invalid or inactive company: ${companyCode}`);
        }
        return res.json();
      })
      .then((body) => {
        if (!isMounted) return;
        const tenantData: TenantInfo = body.data || {
          id: companyCode,
          siteCode: companyCode,
          name: companyCode.toUpperCase(),
          primaryColor: "#0052CC",
          status: "ACTIVE",
        };

        setTenant(tenantData);

        // Inject dynamic CSS variable for brand color
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
        console.warn("[TenantProvider] Fallback for company:", companyCode, err);
        
        // Fallback for development if backend API is offline
        const fallbackTenant: TenantInfo = {
          id: companyCode,
          siteCode: companyCode,
          name: companyCode.toUpperCase(),
          primaryColor: "#0052CC",
          status: "ACTIVE",
        };
        setTenant(fallbackTenant);
        document.documentElement.style.setProperty("--brand-primary-color", "#0052CC");
        document.title = `${fallbackTenant.name} - NCMS`;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyCode, navigate]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
