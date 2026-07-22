package kr.co.tobetheone.ncms.global.tenant;

import java.util.UUID;

/**
 * 멀티테넌트를 위한 현재 요청의 company_id 컨텍스트
 */
public class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_COMPANY_ID = new ThreadLocal<>();

    public static void setCompanyId(UUID companyId) {
        CURRENT_COMPANY_ID.set(companyId);
    }

    public static UUID getCompanyId() {
        return CURRENT_COMPANY_ID.get();
    }

    public static void clear() {
        CURRENT_COMPANY_ID.remove();
    }
}
