package kr.co.tobetheone.ncms.auth.application;

import kr.co.tobetheone.ncms.auth.api.dto.LoginRequest;
import kr.co.tobetheone.ncms.auth.api.dto.PasswordChangeRequest;
import kr.co.tobetheone.ncms.auth.api.dto.TokenResponse;
import kr.co.tobetheone.ncms.global.exception.CustomException;
import kr.co.tobetheone.ncms.global.security.JwtTokenProvider;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.domain.MemberRole;
import kr.co.tobetheone.ncms.member.infrastructure.MemberRepository;
import kr.co.tobetheone.ncms.member.infrastructure.MemberRoleRepository;
import kr.co.tobetheone.ncms.member.infrastructure.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException("아이디 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED));

        if (!"ACTIVE".equals(member.getStatus())) {
            throw new CustomException("사용중지되었거나 비활성화된 계정입니다.", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException("아이디 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        List<MemberRole> memberRoles = memberRoleRepository.findByMemberId(member.getId());
        List<String> roles = memberRoles.stream()
                .map(mr -> roleRepository.findById(mr.getRoleId()).map(role -> role.getCode()).orElse("ROLE_EMPLOYEE"))
                .collect(Collectors.toList());

        if (roles.isEmpty()) {
            roles = List.of("ROLE_EMPLOYEE");
        }

        UUID companyId = member.getCompany() != null ? member.getCompany().getId() : null;
        String accessToken = jwtTokenProvider.createAccessToken(member.getId(), member.getUsername(), companyId, roles);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .memberId(member.getId())
                .username(member.getUsername())
                .name(member.getName())
                .companyId(companyId)
                .roles(roles)
                .build();
    }

    @Transactional
    public void changePassword(UUID memberId, PasswordChangeRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new CustomException("현재 비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        member.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }
}
