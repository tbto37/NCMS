package kr.co.tobetheone.ncms.company.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateCompanyRequest {
    private String siteCode;
    private String name;
    private String logoUrl;
    private String primaryColor;
}
