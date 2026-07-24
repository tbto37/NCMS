package kr.co.tobetheone.ncms.company.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.company.api.dto.CreateCompanyRequest;
import kr.co.tobetheone.ncms.company.api.dto.PublicCompanyResponse;
import kr.co.tobetheone.ncms.company.application.CompanyService;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AdminCompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PublicCompanyResponse>> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        PublicCompanyResponse response = companyService.createCompany(request);
        return ResponseEntity.ok(ApiResponse.success("고객사가 등록되었습니다.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PublicCompanyResponse>> getCompany(@PathVariable("id") UUID id) {
        PublicCompanyResponse response = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
