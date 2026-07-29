package kr.co.tobetheone.ncms.member.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MemberResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private Long departmentId;
    private String departmentName;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String status;
    private List<String> roles;
}
