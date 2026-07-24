package kr.co.tobetheone.ncms.member.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.member.api.dto.CreateMemberRequest;
import kr.co.tobetheone.ncms.member.api.dto.MemberResponse;
import kr.co.tobetheone.ncms.member.api.dto.UpdateMemberRequest;
import kr.co.tobetheone.ncms.member.application.MemberService;
import kr.co.tobetheone.ncms.member.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // --- Company Admin Endpoints (/api/v1/company/members) ---

    @PostMapping("/api/v1/company/members")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<MemberResponse>> createCompanyMember(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @Valid @RequestBody CreateMemberRequest request
    ) {
        MemberResponse response = memberService.createMemberForCompany(userDetails.getCompanyId(), request);
        return ResponseEntity.ok(ApiResponse.success("회원이 성공적으로 등록되었습니다.", response));
    }

    @GetMapping("/api/v1/company/members")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getCompanyMembers(
            @AuthenticationPrincipal NcmsUserDetails userDetails
    ) {
        List<MemberResponse> members = memberService.getMembersByCompany(userDetails.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PutMapping("/api/v1/company/members/{id}")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<MemberResponse>> updateCompanyMember(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateMemberRequest request
    ) {
        MemberResponse response = memberService.updateMember(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/company/members/{id}/status")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<String>> changeCompanyMemberStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") Member.MemberStatus status
    ) {
        memberService.changeMemberStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("회원 상태가 변경되었습니다.", "SUCCESS"));
    }

    // --- System Admin Endpoints (/api/v1/admin/members) ---

    @GetMapping("/api/v1/admin/members")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAllMembersForAdmin() {
        List<MemberResponse> members = memberService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PostMapping("/api/v1/admin/members")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createMemberByAdmin(@RequestBody CreateMemberRequest request) {
        // Enforce Requirement 3.4 & 14.1: Block SYSTEM_ADMIN from registering members
        memberService.registerMemberBySystemAdmin(request);
        return ResponseEntity.status(403).body(ApiResponse.error("시스템 관리자는 회원 등록이 불가능합니다."));
    }

    @PutMapping("/api/v1/admin/members/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMemberByAdmin(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateMemberRequest request
    ) {
        MemberResponse response = memberService.updateMember(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/admin/members/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<String>> changeMemberStatusByAdmin(
            @PathVariable("id") UUID id,
            @RequestParam("status") Member.MemberStatus status
    ) {
        memberService.changeMemberStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("회원 상태가 변경되었습니다.", "SUCCESS"));
    }
}
