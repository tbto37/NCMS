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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final kr.co.tobetheone.ncms.company.infrastructure.CompanyRepository companyRepository;
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
                .map(role -> role.getRoleId())
                .toList();

        if (roles.isEmpty()) {
            roles = List.of("ROLE_EMPLOYEE");
        }

        // 백엔드 차원의 siteCode DB 검증 및 권한 차단
        if (request.getSiteCode() != null && !request.getSiteCode().isBlank()) {
            kr.co.tobetheone.ncms.company.domain.Company requestCompany = companyRepository.findBySiteCode(request.getSiteCode())
                    .orElseThrow(() -> new CustomException("존재하지 않는 고객사 사이트입니다.", HttpStatus.NOT_FOUND));

            if (!"ACTIVE".equals(requestCompany.getStatus())) {
                throw new CustomException("비활성화된 고객사 사이트입니다.", HttpStatus.FORBIDDEN);
            }

            boolean isOperator = roles.contains("ROLE_OPERATOR") || roles.contains("ROLE_SYSTEM_ADMIN");
            if (!isOperator) {
                String memberSiteCode = member.getCompany() != null ? member.getCompany().getSiteCode() : null;
                if (memberSiteCode == null || !memberSiteCode.equalsIgnoreCase(request.getSiteCode())) {
                    throw new CustomException("해당 고객사 사이트에 대한 접근 권한이 없습니다.", HttpStatus.FORBIDDEN);
                }
            }
        }

        String companyId = member.getCompany() != null ? member.getCompany().getId() : null;
        String companyName = member.getCompany() != null ? member.getCompany().getName() : null;
        String companySiteCode = member.getCompany() != null ? member.getCompany().getSiteCode() : null;
        String accessToken = jwtTokenProvider.createAccessToken(member.getId(), member.getUsername(), companyId, roles);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .memberId(member.getId())
                .username(member.getUsername())
                .name(member.getName())
                .companyId(companyId)
                .companyName(companyName)
                .companySiteCode(companySiteCode)
                .roles(roles)
                .build();
    }

    @Transactional
    public void changePassword(String memberId, PasswordChangeRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new CustomException("현재 비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        member.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }
}
