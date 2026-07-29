package kr.co.tobetheone.ncms.template.infrastructure;

import kr.co.tobetheone.ncms.template.domain.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {
    List<ProductOption> findByCategoryAndStatusOrderBySortOrderAsc(String category, String status);
    List<ProductOption> findByStatusOrderBySortOrderAsc(String status);
}
