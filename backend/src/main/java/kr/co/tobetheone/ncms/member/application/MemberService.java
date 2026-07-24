package kr.co.tobetheone.ncms.member.application;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.department.domain.DepartmentRepository;
import kr.co.tobetheone.ncms.member.api.dto.CreateMemberRequest;
import kr.co.tobetheone.ncms.member.api.dto.MemberResponse;
import kr.co.tobetheone.ncms.member.api.dto.UpdateMemberRequest;
import kr.co.tobetheone.ncms.member.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberResponse createMemberForCompany(UUID companyId, CreateMemberRequest request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다: " + request.getUsername());
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        Member member = Member.builder()
                .company(company)
                .department(department)
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .koreanName(request.getKoreanName())
                .englishName(request.getEnglishName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .officePhone(request.getOfficePhone())
                .position(request.getPosition())
                .status(Member.MemberStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        Member savedMember = memberRepository.save(member);

        String roleCode = request.getRoleCode() != null ? request.getRoleCode() : "EMPLOYEE";
        roleRepository.findByCode(roleCode).ifPresent(role -> {
            MemberRole memberRole = MemberRole.builder()
                    .member(savedMember)
                    .role(role)
                    .grantedAt(Instant.now())
                    .build();
            memberRoleRepository.save(memberRole);
        });

        return MemberResponse.from(savedMember);
    }

    @Transactional
    public MemberResponse registerMemberBySystemAdmin(CreateMemberRequest request) {
        // Enforce Requirement 3.4 & 14.1: SYSTEM_ADMIN cannot register members via API
        throw new AccessDeniedException("로그컴 시스템 관리자는 회원 등록 권한이 없습니다. 임직원 계정 등록은 기업 관리자 업무입니다.");
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembersByCompany(UUID companyId) {
        return memberRepository.findByCompanyId(companyId).stream()
                .map(MemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAll().stream()
                .map(MemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse updateMember(UUID memberId, UpdateMemberRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        Member updatedMember = Member.builder()
                .id(member.getId())
                .company(member.getCompany())
                .department(department != null ? department : member.getDepartment())
                .username(member.getUsername())
                .passwordHash(member.getPasswordHash())
                .koreanName(request.getKoreanName())
                .englishName(request.getEnglishName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .officePhone(request.getOfficePhone())
                .position(request.getPosition())
                .status(member.getStatus())
                .failedLoginAttempts(member.getFailedLoginAttempts())
                .build();

        return MemberResponse.from(memberRepository.save(updatedMember));
    }

    @Transactional
    public void changeMemberStatus(UUID memberId, Member.MemberStatus status) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Member updatedMember = Member.builder()
                .id(member.getId())
                .company(member.getCompany())
                .department(member.getDepartment())
                .username(member.getUsername())
                .passwordHash(member.getPasswordHash())
                .koreanName(member.getKoreanName())
                .englishName(member.getEnglishName())
                .email(member.getEmail())
                .mobile(member.getMobile())
                .officePhone(member.getOfficePhone())
                .position(member.getPosition())
                .status(status)
                .build();

        memberRepository.save(updatedMember);
    }
}
