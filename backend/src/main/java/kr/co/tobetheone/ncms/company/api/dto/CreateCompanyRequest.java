package kr.co.tobetheone.ncms.company.api.dto;

import jakarta.validation.constraints.NotBlank;
import kr.co.tobetheone.ncms.company.domain.Company;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateCompanyRequest {

    @NotBlank(message = "고객사 코드는 필수입니다.")
    private String siteCode;

    @NotBlank(message = "회사명은 필수입니다.")
    private String name;

    private String logoFileKey;
    private String primaryColor;

    private Company.ApprovalPolicy approvalPolicy;
    private Company.ShippingAddressPolicy shippingAddressPolicy;
    private Company.PriceVisibility priceVisibility;
}
