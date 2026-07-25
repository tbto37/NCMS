package kr.co.tobetheone.ncms.template.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class TemplateResponse {
    private UUID id;
    private String name;
    private String previewFrontUrl;
    private String previewBackUrl;
    private String status;
}
