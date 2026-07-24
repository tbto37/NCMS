package kr.co.tobetheone.ncms.template.application;

import kr.co.tobetheone.ncms.template.api.dto.TemplateResponse;
import kr.co.tobetheone.ncms.template.domain.Template;
import kr.co.tobetheone.ncms.template.domain.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public List<TemplateResponse> getActiveTemplates() {
        return templateRepository.findByStatus(Template.TemplateStatus.ACTIVE).stream()
                .map(TemplateResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TemplateResponse getTemplateById(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("템플릿을 찾을 수 없습니다."));
        return TemplateResponse.from(template);
    }
}
