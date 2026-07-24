package kr.co.tobetheone.ncms.template.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.template.api.dto.TemplateResponse;
import kr.co.tobetheone.ncms.template.application.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/company/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getTemplates() {
        List<TemplateResponse> templates = templateService.getActiveTemplates();
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> getTemplate(@PathVariable("id") UUID id) {
        TemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success(template));
    }
}
