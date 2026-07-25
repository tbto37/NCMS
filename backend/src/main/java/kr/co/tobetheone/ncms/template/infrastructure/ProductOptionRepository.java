package kr.co.tobetheone.ncms.template.infrastructure;

import kr.co.tobetheone.ncms.template.domain.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductOptionRepository extends JpaRepository<ProductOption, UUID> {
}
