package kr.co.tobetheone.ncms.auth.api;

import kr.co.tobetheone.ncms.auth.api.dto.LoginRequest;
import kr.co.tobetheone.ncms.auth.api.dto.PasswordChangeRequest;
import kr.co.tobetheone.ncms.auth.api.dto.TokenResponse;
import kr.co.tobetheone.ncms.auth.application.AuthService;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/password/change")
    public ApiResponse<String> changePassword(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @RequestBody PasswordChangeRequest request) {
        authService.changePassword(userDetails.getMemberId(), request);
        return ApiResponse.success("비밀번호가 성공적으로 변경되었습니다.");
    }
}
