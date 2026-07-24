import { createContext } from "react";

export interface TenantInfo {
  id: string;
  siteCode: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  status: string;
}

export interface TenantContextType {
  tenant: TenantInfo | null;
  isLoading: boolean;
  error: string | null;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
