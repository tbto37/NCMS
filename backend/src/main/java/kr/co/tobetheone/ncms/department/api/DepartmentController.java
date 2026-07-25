package kr.co.tobetheone.ncms.department.api;

import kr.co.tobetheone.ncms.department.api.dto.CreateDepartmentRequest;
import kr.co.tobetheone.ncms.department.application.DepartmentService;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ApiResponse<List<Department>> getDepartments(@AuthenticationPrincipal NcmsUserDetails userDetails) {
        return ApiResponse.success(departmentService.getDepartmentsByCompany(userDetails.getCompanyId()));
    }

    @PostMapping
    public ApiResponse<Department> createDepartment(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @RequestBody CreateDepartmentRequest request) {
        return ApiResponse.success(departmentService.createDepartment(userDetails.getCompanyId(), request));
    }
}
