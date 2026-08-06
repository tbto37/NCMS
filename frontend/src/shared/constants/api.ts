const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "https://api.logcom.co.kr"
  : "";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/api\/?$/, "");
