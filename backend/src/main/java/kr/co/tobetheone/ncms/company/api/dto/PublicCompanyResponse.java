package kr.co.tobetheone.ncms.company.api.dto;

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
}
