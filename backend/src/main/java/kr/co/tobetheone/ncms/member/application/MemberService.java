package kr.co.tobetheone.ncms.member.application;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.infrastructure.CompanyRepository;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.department.infrastructure.DepartmentRepository;
import kr.co.tobetheone.ncms.global.exception.CustomException;
import kr.co.tobetheone.ncms.member.api.dto.CreateMemberRequest;
import kr.co.tobetheone.ncms.member.api.dto.MemberResponse;
import kr.co.tobetheone.ncms.member.api.dto.UpdateMemberRequest;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.domain.MemberRole;
import kr.co.tobetheone.ncms.member.domain.Role;
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
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<MemberResponse> getMembersByCompany(UUID companyId) {
        List<Member> members = memberRepository.findByCompanyId(companyId);
        return members.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse createMemberByCompanyAdmin(UUID companyId, String currentUserRole, CreateMemberRequest request) {
        if ("ROLE_SYSTEM_ADMIN".equals(currentUserRole)) {
            throw new CustomException("SYSTEM_ADMIN은 신규 임직원을 직접 등록할 수 없습니다. (403 Forbidden)", HttpStatus.FORBIDDEN);
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException("고객사를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        if (memberRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new CustomException("이미 존재하는 아이디입니다.", HttpStatus.BAD_REQUEST);
        }

        Member member = Member.builder()
                .company(company)
                .department(department)
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .status("ACTIVE")
                .build();
        member = memberRepository.save(member);

        String roleCode = request.getRoleCode() != null ? request.getRoleCode() : "ROLE_EMPLOYEE";
        Role role = roleRepository.findByCode(roleCode)
                .orElseGet(() -> roleRepository.findByCode("ROLE_EMPLOYEE")
                        .orElseThrow(() -> new CustomException("기본 역할을 찾을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR)));

        memberRoleRepository.save(MemberRole.builder()
                .memberId(member.getId())
                .roleId(role.getId())
                .build());

        return toResponse(member);
    }

    @Transactional
    public MemberResponse updateMember(UUID memberId, UpdateMemberRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        member.updateInfo(request.getName(), request.getEmail(), request.getPhone(), department, request.getStatus());
        return toResponse(member);
    }

    private MemberResponse toResponse(Member member) {
        List<MemberRole> memberRoles = memberRoleRepository.findByMemberId(member.getId());
        List<String> roles = memberRoles.stream()
                .map(mr -> roleRepository.findById(mr.getRoleId()).map(Role::getCode).orElse(""))
                .collect(Collectors.toList());

        return MemberResponse.builder()
                .id(member.getId())
                .companyId(member.getCompany() != null ? member.getCompany().getId() : null)
                .departmentId(member.getDepartment() != null ? member.getDepartment().getId() : null)
                .departmentName(member.getDepartment() != null ? member.getDepartment().getName() : null)
                .username(member.getUsername())
                .name(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .status(member.getStatus())
                .roles(roles)
                .build();
    }
}
