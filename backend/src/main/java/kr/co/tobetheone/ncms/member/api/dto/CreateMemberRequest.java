package kr.co.tobetheone.ncms.member.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class CreateMemberRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private UUID departmentId;
    private String roleCode;
}
