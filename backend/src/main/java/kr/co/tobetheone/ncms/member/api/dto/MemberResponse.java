package kr.co.tobetheone.ncms.member.api.dto;

import kr.co.tobetheone.ncms.member.domain.Member;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class MemberResponse {
    private UUID id;
    private String username;
    private String koreanName;
    private String englishName;
    private String email;
    private String mobile;
    private String officePhone;
    private String position;
    private UUID companyId;
    private String companyName;
    private UUID departmentId;
    private String departmentName;
    private String status;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .username(member.getUsername())
                .koreanName(member.getKoreanName())
                .englishName(member.getEnglishName())
                .email(member.getEmail())
                .mobile(member.getMobile())
                .officePhone(member.getOfficePhone())
                .position(member.getPosition())
                .companyId(member.getCompany() != null ? member.getCompany().getId() : null)
                .companyName(member.getCompany() != null ? member.getCompany().getName() : null)
                .departmentId(member.getDepartment() != null ? member.getDepartment().getId() : null)
                .departmentName(member.getDepartment() != null ? member.getDepartment().getName() : null)
                .status(member.getStatus() != null ? member.getStatus().name() : "ACTIVE")
                .build();
    }
}
