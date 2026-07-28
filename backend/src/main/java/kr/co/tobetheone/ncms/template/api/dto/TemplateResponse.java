package kr.co.tobetheone.ncms.template.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TemplateResponse {
    private String id;
    private String name;
    private String previewFrontUrl;
    private String previewBackUrl;
    private String status;
}
