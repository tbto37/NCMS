package kr.co.tobetheone.ncms.auth.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
}
