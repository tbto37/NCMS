package kr.co.tobetheone.ncms.shipment.infrastructure;

import kr.co.tobetheone.ncms.shipment.domain.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    Optional<Shipment> findByOrderId(String orderId);
}
