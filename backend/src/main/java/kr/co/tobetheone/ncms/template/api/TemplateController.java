package kr.co.tobetheone.ncms.template.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.template.api.dto.TemplateResponse;
import kr.co.tobetheone.ncms.template.application.TemplateService;
import kr.co.tobetheone.ncms.template.domain.Template;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping("/api/v1/company/templates")
    public ApiResponse<List<TemplateResponse>> getCompanyTemplates(@AuthenticationPrincipal NcmsUserDetails userDetails) {
        return ApiResponse.success(templateService.getTemplatesForCompany(userDetails.getCompanyId()));
    }

    @PostMapping("/api/v1/admin/templates")
    public ApiResponse<Template> createTemplate(@RequestBody CreateTemplateRequest request) {
        return ApiResponse.success(templateService.createTemplate(request.getName(), request.getPreviewFrontUrl(), request.getPreviewBackUrl()));
    }

    @Getter
    @NoArgsConstructor
    public static class CreateTemplateRequest {
        private String name;
        private String previewFrontUrl;
        private String previewBackUrl;
    }
}
