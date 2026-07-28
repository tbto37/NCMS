package kr.co.tobetheone.ncms.template.infrastructure;

import kr.co.tobetheone.ncms.template.domain.Template;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateRepository extends JpaRepository<Template, String> {
}
