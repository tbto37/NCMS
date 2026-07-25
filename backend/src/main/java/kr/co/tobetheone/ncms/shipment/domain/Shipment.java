package kr.co.tobetheone.ncms.shipment.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.order.domain.Order;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "carrier_code", nullable = false, length = 50)
    private String carrierCode;

    @Column(name = "tracking_number", nullable = false, length = 100)
    private String trackingNumber;

    @Column(name = "shipped_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant shippedAt = Instant.now();
}
