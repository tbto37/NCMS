package kr.co.tobetheone.ncms.approval.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.order.domain.Order;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "order_approvals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderApproval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_member_id")
    private Member approverMember;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_action", nullable = false, length = 20)
    private Action action;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "action_at", nullable = false)
    private Instant actionAt;

    public enum Action {
        APPROVED, REJECTED
    }
}
