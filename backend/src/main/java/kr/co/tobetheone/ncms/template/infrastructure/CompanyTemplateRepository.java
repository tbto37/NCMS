package kr.co.tobetheone.ncms.template.infrastructure;

import kr.co.tobetheone.ncms.template.domain.CompanyTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompanyTemplateRepository extends JpaRepository<CompanyTemplate, CompanyTemplate.CompanyTemplateId> {
    List<CompanyTemplate> findByCompanyId(UUID companyId);
}
