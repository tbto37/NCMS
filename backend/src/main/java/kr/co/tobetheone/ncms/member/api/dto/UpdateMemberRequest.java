package kr.co.tobetheone.ncms.member.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateMemberRequest {
    private String name;
    private String email;
    private String phone;
    private String departmentId;
    private String status;
}
