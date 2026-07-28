package kr.co.tobetheone.ncms.template.application;

import kr.co.tobetheone.ncms.template.api.dto.TemplateResponse;
import kr.co.tobetheone.ncms.template.domain.CompanyTemplate;
import kr.co.tobetheone.ncms.template.domain.Template;
import kr.co.tobetheone.ncms.template.infrastructure.CompanyTemplateRepository;
import kr.co.tobetheone.ncms.template.infrastructure.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final CompanyTemplateRepository companyTemplateRepository;

    public List<TemplateResponse> getTemplatesForCompany(String companyId) {
        List<CompanyTemplate> mappings = companyTemplateRepository.findByCompanyId(companyId);
        List<String> templateIds = mappings.stream().map(ct -> ct.getTemplateId()).collect(Collectors.toList());

        List<Template> templates = templateRepository.findAllById(templateIds);
        return templates.stream()
                .filter(t -> "ACTIVE".equals(t.getStatus()))
                .map(t -> TemplateResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .previewFrontUrl(t.getPreviewFrontUrl())
                        .previewBackUrl(t.getPreviewBackUrl())
                        .status(t.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public Template createTemplate(String name, String previewFrontUrl, String previewBackUrl) {
        String id = "T_" + System.currentTimeMillis();
        Template template = Template.builder()
                .id(id)
                .name(name)
                .previewFrontUrl(previewFrontUrl)
                .previewBackUrl(previewBackUrl)
                .status("ACTIVE")
                .build();
        return templateRepository.save(template);
    }
}
