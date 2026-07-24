package kr.co.tobetheone.ncms.department.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository {
    Optional<Department> findById(UUID id);
    List<Department> findByCompanyId(UUID companyId);
    Department save(Department department);
}
