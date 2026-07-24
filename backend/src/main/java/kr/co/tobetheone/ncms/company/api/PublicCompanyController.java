package kr.co.tobetheone.ncms.company.api;

import kr.co.tobetheone.ncms.company.api.dto.PublicCompanyResponse;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/companies")
@RequiredArgsConstructor
public class PublicCompanyController {

    private final CompanyRepository companyRepository;

    @GetMapping("/{siteCode}")
    public ResponseEntity<ApiResponse<PublicCompanyResponse>> getPublicCompanyInfo(@PathVariable("siteCode") String siteCode) {
        return companyRepository.findBySiteCodeAndStatus(siteCode, Company.CompanyStatus.ACTIVE)
                .map(company -> ResponseEntity.ok(ApiResponse.success(PublicCompanyResponse.from(company))))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(ApiResponse.error("Company not found or inactive: " + siteCode)));
    }
}
