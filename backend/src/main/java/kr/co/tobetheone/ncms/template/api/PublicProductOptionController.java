package kr.co.tobetheone.ncms.template.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.template.api.dto.ProductOptionResponse;
import kr.co.tobetheone.ncms.template.application.ProductOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-options")
@RequiredArgsConstructor
public class PublicProductOptionController {

    private final ProductOptionService productOptionService;

    @GetMapping
    public ApiResponse<List<ProductOptionResponse>> getProductOptions(
            @RequestParam(name = "category", required = false) String category) {
        return ApiResponse.success(productOptionService.getActiveOptions(category));
    }
}
