package kr.co.tobetheone.ncms.company.infrastructure;

import kr.co.tobetheone.ncms.company.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findBySiteCode(String siteCode);
}
