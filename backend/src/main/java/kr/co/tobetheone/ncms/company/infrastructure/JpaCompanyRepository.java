package kr.co.tobetheone.ncms.company.infrastructure;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaCompanyRepository extends JpaRepository<Company, UUID>, CompanyRepository {

    @Override
    Optional<Company> findBySiteCode(String siteCode);

    @Override
    Optional<Company> findBySiteCodeAndStatus(String siteCode, Company.CompanyStatus status);
}
