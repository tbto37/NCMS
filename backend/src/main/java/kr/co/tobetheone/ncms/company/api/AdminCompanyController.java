package kr.co.tobetheone.ncms.company.api;

import kr.co.tobetheone.ncms.company.api.dto.CreateCompanyRequest;
import kr.co.tobetheone.ncms.company.application.CompanyService;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
public class AdminCompanyController {

    private final CompanyService companyService;

    @GetMapping("/{id}")
    public ApiResponse<Company> getCompany(@PathVariable Long id) {
        return ApiResponse.success(companyService.getCompanyById(id));
    }

    @PostMapping
    public ApiResponse<Company> createCompany(@RequestBody CreateCompanyRequest request) {
        return ApiResponse.success(companyService.createCompany(request));
    }
}
