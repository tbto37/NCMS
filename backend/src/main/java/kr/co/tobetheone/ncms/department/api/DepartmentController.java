package kr.co.tobetheone.ncms.department.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.department.api.dto.CreateDepartmentRequest;
import kr.co.tobetheone.ncms.department.api.dto.DepartmentResponse;
import kr.co.tobetheone.ncms.department.application.DepartmentService;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SYSTEM_ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments(
            @AuthenticationPrincipal NcmsUserDetails userDetails
    ) {
        List<DepartmentResponse> departments = departmentService.getDepartmentsByCompany(userDetails.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @Valid @RequestBody CreateDepartmentRequest request
    ) {
        DepartmentResponse response = departmentService.createDepartment(userDetails.getCompanyId(), request);
        return ResponseEntity.ok(ApiResponse.success("부서가 등록되었습니다.", response));
    }
}
