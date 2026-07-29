package kr.co.tobetheone.ncms.auth.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TokenResponse {
    private String accessToken;
    private String tokenType;
    private String memberId;
    private String username;
    private String name;
    private String companyId;
    private String companyName;
    private String companySiteCode;
    private List<String> roles;
}
