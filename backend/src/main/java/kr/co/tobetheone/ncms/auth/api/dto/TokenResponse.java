package kr.co.tobetheone.ncms.auth.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class TokenResponse {
    private String accessToken;
    private String tokenType;
    private UUID memberId;
    private String username;
    private String name;
    private UUID companyId;
    private List<String> roles;
}
