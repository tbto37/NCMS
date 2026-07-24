package kr.co.tobetheone.ncms.company.api.dto;

import kr.co.tobetheone.ncms.company.domain.Company;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class PublicCompanyResponse {

    private UUID id;
    private String siteCode;
    private String name;
    private String logoUrl;
    private String primaryColor;
    private String status;

    public static PublicCompanyResponse from(Company company) {
        return PublicCompanyResponse.builder()
                .id(company.getId())
                .siteCode(company.getSiteCode())
                .name(company.getName())
                .logoUrl(company.getLogoFileKey())
                .primaryColor(company.getPrimaryColor())
                .status(company.getStatus() != null ? company.getStatus().name() : "ACTIVE")
                .build();
    }
}
