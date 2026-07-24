package kr.co.tobetheone.ncms.template.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TemplateRepository {
    Optional<Template> findById(UUID id);
    List<Template> findByStatus(Template.TemplateStatus status);
    List<Template> findAll();
    Template save(Template template);
}
