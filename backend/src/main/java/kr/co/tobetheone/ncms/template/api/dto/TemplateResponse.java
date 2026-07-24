package kr.co.tobetheone.ncms.template.api.dto;

import kr.co.tobetheone.ncms.template.domain.Template;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class TemplateResponse {
    private UUID id;
    private String templateCode;
    private String templateName;
    private String description;
    private String status;

    public static TemplateResponse from(Template template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .templateCode(template.getTemplateCode())
                .templateName(template.getTemplateName())
                .description(template.getDescription())
                .status(template.getStatus() != null ? template.getStatus().name() : "ACTIVE")
                .build();
    }
}
