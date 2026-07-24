package kr.co.tobetheone.ncms.order.api.dto;

import kr.co.tobetheone.ncms.order.domain.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private UUID companyId;
    private String companyName;
    private UUID requesterMemberId;
    private String requesterName;
    private String approvalStatus;
    private String productionStatus;
    private String shippingRecipient;
    private String shippingPhone;
    private String shippingPostalCode;
    private String shippingAddress;
    private String shippingAddressDetail;
    private String orderMemo;
    private BigDecimal totalAmount;
    private BigDecimal grandTotal;
    private Instant submittedAt;
    private Instant approvedAt;
    private Instant rejectedAt;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .companyId(order.getCompany() != null ? order.getCompany().getId() : null)
                .companyName(order.getCompany() != null ? order.getCompany().getName() : null)
                .requesterMemberId(order.getRequesterMember() != null ? order.getRequesterMember().getId() : null)
                .requesterName(order.getRequesterMember() != null ? order.getRequesterMember().getKoreanName() : null)
                .approvalStatus(order.getApprovalStatus() != null ? order.getApprovalStatus().name() : "PENDING")
                .productionStatus(order.getProductionStatus() != null ? order.getProductionStatus().name() : "DRAFT")
                .shippingRecipient(order.getShippingRecipient())
                .shippingPhone(order.getShippingPhone())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingAddress(order.getShippingAddress())
                .shippingAddressDetail(order.getShippingAddressDetail())
                .orderMemo(order.getOrderMemo())
                .totalAmount(order.getTotalAmount())
                .grandTotal(order.getGrandTotal())
                .submittedAt(order.getSubmittedAt())
                .approvedAt(order.getApprovedAt())
                .rejectedAt(order.getRejectedAt())
                .build();
    }
}
