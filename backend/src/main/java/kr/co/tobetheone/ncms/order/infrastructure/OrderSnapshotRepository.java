package kr.co.tobetheone.ncms.order.infrastructure;

import kr.co.tobetheone.ncms.order.domain.OrderSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderSnapshotRepository extends JpaRepository<OrderSnapshot, UUID> {
    Optional<OrderSnapshot> findByOrderId(UUID orderId);
}
