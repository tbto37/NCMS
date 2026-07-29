package kr.co.tobetheone.ncms.template.api.dto;

import kr.co.tobetheone.ncms.template.domain.ProductOption;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductOptionResponse {
    private Long id;
    private String category;
    private String name;
    private Integer sortOrder;
    private String status;

    public static ProductOptionResponse from(ProductOption option) {
        return ProductOptionResponse.builder()
                .id(option.getId())
                .category(option.getCategory())
                .name(option.getName())
                .sortOrder(option.getSortOrder())
                .status(option.getStatus())
                .build();
    }
}
