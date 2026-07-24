package kr.co.tobetheone.ncms.department.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class CreateDepartmentRequest {

    @NotBlank(message = "부서명은 필수입니다.")
    private String name;

    private UUID parentDepartmentId;
    private Integer sortOrder;
}
