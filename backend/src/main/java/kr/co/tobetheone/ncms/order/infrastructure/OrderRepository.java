package kr.co.tobetheone.ncms.order.infrastructure;

import kr.co.tobetheone.ncms.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<Order> findByMemberIdOrderByCreatedAtDesc(UUID memberId);
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    List<Order> findAllByOrderByCreatedAtDesc();
}
