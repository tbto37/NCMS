package kr.co.tobetheone.ncms.template.infrastructure;

import kr.co.tobetheone.ncms.template.domain.Template;
import kr.co.tobetheone.ncms.template.domain.TemplateRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaTemplateRepository extends JpaRepository<Template, UUID>, TemplateRepository {
    @Override
    List<Template> findByStatus(Template.TemplateStatus status);
}
