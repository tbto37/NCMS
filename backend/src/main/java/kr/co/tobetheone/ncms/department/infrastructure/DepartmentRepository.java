package kr.co.tobetheone.ncms.department.infrastructure;

import kr.co.tobetheone.ncms.department.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByCompanyId(String companyId);
}
