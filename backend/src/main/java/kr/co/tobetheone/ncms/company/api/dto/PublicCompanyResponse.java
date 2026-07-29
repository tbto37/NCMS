package kr.co.tobetheone.ncms.company.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicCompanyResponse {
    private Long id;
    private String siteCode;
    private String name;
    private String logoUrl;
    private String primaryColor;
}
