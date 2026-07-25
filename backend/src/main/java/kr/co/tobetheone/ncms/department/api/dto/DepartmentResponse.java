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
