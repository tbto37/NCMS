package kr.co.tobetheone.ncms.department.api.dto;

import kr.co.tobetheone.ncms.department.domain.Department;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentResponse {
    private Long id;
    private Long companyId;
    private String name;
    private Integer sortOrder;
    private String status;

    public static DepartmentResponse from(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .companyId(department.getCompany() != null ? department.getCompany().getId() : null)
                .name(department.getName())
                .sortOrder(department.getSortOrder())
                .status(department.getStatus())
                .build();
    }
}
