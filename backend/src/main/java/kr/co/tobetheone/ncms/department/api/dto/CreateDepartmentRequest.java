package kr.co.tobetheone.ncms.department.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateDepartmentRequest {
    private String name;
    private Integer sortOrder;
}
