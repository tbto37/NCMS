package kr.co.tobetheone.ncms.company.api;

import kr.co.tobetheone.ncms.company.application.CompanyService;
import kr.co.tobetheone.ncms.company.api.dto.PublicCompanyResponse;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/companies")
@RequiredArgsConstructor
public class PublicCompanyController {

    private final CompanyService companyService;

    @GetMapping("/{siteCode}")
    public ApiResponse<PublicCompanyResponse> getPublicCompanyInfo(@PathVariable String siteCode) {
        return ApiResponse.success(companyService.getPublicCompanyInfo(siteCode));
    }
}
