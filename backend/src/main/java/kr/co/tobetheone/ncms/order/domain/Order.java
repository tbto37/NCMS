package kr.co.tobetheone.ncms.order.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import kr.co.tobetheone.ncms.member.domain.Member;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_member_id", nullable = false)
    private Member requesterMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_department_id")
    private Department requesterDepartment;

    @Column(name = "order_number", unique = true, nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private ApprovalStatus approvalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "production_status", nullable = false, length = 20)
    private ProductionStatus productionStatus;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "shipping_recipient", length = 100)
    private String shippingRecipient;

    @Column(name = "shipping_phone", length = 20)
    private String shippingPhone;

    @Column(name = "shipping_postal_code", length = 10)
    private String shippingPostalCode;

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "shipping_address_detail", length = 500)
    private String shippingAddressDetail;

    @Column(name = "order_memo", columnDefinition = "TEXT")
    private String orderMemo;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Version
    private Long version;

    public enum ApprovalStatus {
        NOT_REQUIRED, PENDING, APPROVED, REJECTED
    }

    public enum ProductionStatus {
        DRAFT, RECEIVED, PRINTING, SHIPPED, DELIVERED, CANCELLED
    }
}
