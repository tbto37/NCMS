package kr.co.tobetheone.ncms.order.infrastructure;

import kr.co.tobetheone.ncms.order.domain.OrderSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderSnapshotRepository extends JpaRepository<OrderSnapshot, Long> {
    Optional<OrderSnapshot> findByOrderId(Long orderId);
}
