package kr.co.tobetheone.ncms.member.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.member.api.dto.CreateMemberRequest;
import kr.co.tobetheone.ncms.member.api.dto.MemberResponse;
import kr.co.tobetheone.ncms.member.api.dto.UpdateMemberRequest;
import kr.co.tobetheone.ncms.member.application.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/company/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ApiResponse<List<MemberResponse>> getMembers(@AuthenticationPrincipal NcmsUserDetails userDetails) {
        return ApiResponse.success(memberService.getMembersByCompany(userDetails.getCompanyId()));
    }

    @PostMapping
    public ApiResponse<MemberResponse> createMember(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @RequestBody CreateMemberRequest request) {
        String primaryRole = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");

        return ApiResponse.success(memberService.createMemberByCompanyAdmin(userDetails.getCompanyId(), primaryRole, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MemberResponse> updateMember(
            @PathVariable UUID id,
            @RequestBody UpdateMemberRequest request) {
        return ApiResponse.success(memberService.updateMember(id, request));
    }
}
