package kr.co.tobetheone.ncms.order.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.template.domain.Template;
import lombok.*;

import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@DynamicInsert
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private Template template;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "recipient_name", nullable = false, length = 50)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 30)
    private String recipientPhone;

    @Column(length = 10)
    private String zipcode;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "address_detail", length = 255)
    private String addressDetail;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    public void approve() {
        this.status = "APPROVED";
        this.rejectReason = null;
    }

    public void reject(String reason) {
        this.status = "REJECTED";
        this.rejectReason = reason;
    }

    public void updateStatus(String newStatus) {
        this.status = newStatus;
    }
}
