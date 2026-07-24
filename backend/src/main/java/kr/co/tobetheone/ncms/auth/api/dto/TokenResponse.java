package kr.co.tobetheone.ncms.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UUID memberId;
    private String username;
    private String koreanName;
    private UUID companyId;
    private List<String> roles;
}
