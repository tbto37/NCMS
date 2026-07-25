package kr.co.tobetheone.ncms.department.application;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.infrastructure.CompanyRepository;
import kr.co.tobetheone.ncms.department.api.dto.CreateDepartmentRequest;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.department.infrastructure.DepartmentRepository;
import kr.co.tobetheone.ncms.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;

    public List<Department> getDepartmentsByCompany(UUID companyId) {
        return departmentRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Department createDepartment(UUID companyId, CreateDepartmentRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException("고객사를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Department department = Department.builder()
                .company(company)
                .name(request.getName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .status("ACTIVE")
                .build();
        return departmentRepository.save(department);
    }
}
