package kr.co.tobetheone.ncms.auth.application;

import kr.co.tobetheone.ncms.auth.api.dto.LoginRequest;
import kr.co.tobetheone.ncms.auth.api.dto.PasswordChangeRequest;
import kr.co.tobetheone.ncms.auth.api.dto.TokenResponse;
import kr.co.tobetheone.ncms.global.security.JwtTokenProvider;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.domain.MemberRepository;
import kr.co.tobetheone.ncms.member.domain.MemberRole;
import kr.co.tobetheone.ncms.member.domain.MemberRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new IllegalStateException("사용중지되거나 활성화되지 않은 계정입니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        List<MemberRole> memberRoles = memberRoleRepository.findByMemberId(member.getId());
        List<String> roles = memberRoles.stream()
                .map(mr -> mr.getRole().getCode())
                .collect(Collectors.toList());

        if (roles.isEmpty()) {
            roles = List.of("EMPLOYEE");
        }

        UUID companyId = member.getCompany() != null ? member.getCompany().getId() : null;

        String accessToken = jwtTokenProvider.createAccessToken(member.getId(), member.getUsername(), companyId, roles);
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getId(), member.getUsername());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .memberId(member.getId())
                .username(member.getUsername())
                .koreanName(member.getKoreanName())
                .companyId(companyId)
                .roles(roles)
                .build();
    }

    @Transactional
    public void changePassword(UUID memberId, PasswordChangeRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // Note: Password update logic can be extended on Member entity
    }
}
