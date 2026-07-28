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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;

    public List<Department> getDepartmentsByCompany(String companyId) {
        return departmentRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Department createDepartment(String companyId, CreateDepartmentRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException("고객사를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        String id = "DEP_" + System.currentTimeMillis();
        Department department = Department.builder()
                .id(id)
                .company(company)
                .name(request.getName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .status("ACTIVE")
                .build();
        return departmentRepository.save(department);
    }
}
