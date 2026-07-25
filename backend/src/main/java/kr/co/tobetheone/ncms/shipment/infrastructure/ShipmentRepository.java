package kr.co.tobetheone.ncms.shipment.infrastructure;

import kr.co.tobetheone.ncms.shipment.domain.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    Optional<Shipment> findByOrderId(UUID orderId);
}
