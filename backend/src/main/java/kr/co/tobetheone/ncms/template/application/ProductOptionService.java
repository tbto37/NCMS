package kr.co.tobetheone.ncms.template.application;

import kr.co.tobetheone.ncms.template.api.dto.ProductOptionResponse;
import kr.co.tobetheone.ncms.template.domain.ProductOption;
import kr.co.tobetheone.ncms.template.infrastructure.ProductOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductOptionService {

    private final ProductOptionRepository productOptionRepository;

    public List<ProductOptionResponse> getActiveOptions(String category) {
        List<ProductOption> options = (category != null && !category.isBlank())
                ? productOptionRepository.findByCategoryAndStatusOrderBySortOrderAsc(category.toUpperCase(), "ACTIVE")
                : productOptionRepository.findByStatusOrderBySortOrderAsc("ACTIVE");

        return options.stream().map(ProductOptionResponse::from).toList();
    }
}
