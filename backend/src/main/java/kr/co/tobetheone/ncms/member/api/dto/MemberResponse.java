package kr.co.tobetheone.ncms.member.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class MemberResponse {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private UUID departmentId;
    private String departmentName;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String status;
    private List<String> roles;
}
