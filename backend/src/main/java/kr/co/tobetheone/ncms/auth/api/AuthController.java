package kr.co.tobetheone.ncms.auth.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.auth.api.dto.LoginRequest;
import kr.co.tobetheone.ncms.auth.api.dto.PasswordChangeRequest;
import kr.co.tobetheone.ncms.auth.api.dto.TokenResponse;
import kr.co.tobetheone.ncms.auth.application.AuthService;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/password/change")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        authService.changePassword(userDetails.getMemberId(), request);
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 변경되었습니다.", "SUCCESS"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("로그아웃 되었습니다.", "SUCCESS"));
    }
}
