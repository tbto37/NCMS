package kr.co.tobetheone.ncms.member.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MemberResponse {
    private String id;
    private String companyId;
    private String companyName;
    private String departmentId;
    private String departmentName;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String status;
    private List<String> roles;
}
