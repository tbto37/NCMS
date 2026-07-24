package kr.co.tobetheone.ncms.company.domain;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository {

    Optional<Company> findById(UUID id);

    Optional<Company> findBySiteCode(String siteCode);

    Optional<Company> findBySiteCodeAndStatus(String siteCode, Company.CompanyStatus status);

    Company save(Company company);
}
