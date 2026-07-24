package kr.co.tobetheone.ncms.department.infrastructure;

import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.department.domain.DepartmentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaDepartmentRepository extends JpaRepository<Department, UUID>, DepartmentRepository {
    @Override
    List<Department> findByCompanyId(UUID companyId);
}
