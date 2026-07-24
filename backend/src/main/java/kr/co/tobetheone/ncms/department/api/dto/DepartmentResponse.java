package kr.co.tobetheone.ncms.department.api.dto;

import kr.co.tobetheone.ncms.department.domain.Department;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class DepartmentResponse {
    private UUID id;
    private UUID companyId;
    private UUID parentDepartmentId;
    private String name;
    private String fullPath;
    private Integer sortOrder;
    private String status;

    public static DepartmentResponse from(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .companyId(department.getCompany() != null ? department.getCompany().getId() : null)
                .parentDepartmentId(department.getParentDepartment() != null ? department.getParentDepartment().getId() : null)
                .name(department.getName())
                .fullPath(department.getFullPath())
                .sortOrder(department.getSortOrder())
                .status(department.getStatus() != null ? department.getStatus().name() : "ACTIVE")
                .build();
    }
}
