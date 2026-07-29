package kr.co.tobetheone.ncms.order.infrastructure;

import kr.co.tobetheone.ncms.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Order> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
