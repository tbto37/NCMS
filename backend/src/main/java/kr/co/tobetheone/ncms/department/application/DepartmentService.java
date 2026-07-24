package kr.co.tobetheone.ncms.department.application;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import kr.co.tobetheone.ncms.department.api.dto.CreateDepartmentRequest;
import kr.co.tobetheone.ncms.department.api.dto.DepartmentResponse;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.department.domain.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartmentsByCompany(UUID companyId) {
        return departmentRepository.findByCompanyId(companyId).stream()
                .map(DepartmentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse createDepartment(UUID companyId, CreateDepartmentRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));

        Department parent = null;
        if (request.getParentDepartmentId() != null) {
            parent = departmentRepository.findById(request.getParentDepartmentId()).orElse(null);
        }

        Department department = Department.builder()
                .company(company)
                .parentDepartment(parent)
                .name(request.getName())
                .fullPath(parent != null ? parent.getName() + " > " + request.getName() : request.getName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .status(Department.DepartmentStatus.ACTIVE)
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }
}
