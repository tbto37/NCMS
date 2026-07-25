package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrderResponse {
    private UUID id;
    private String orderNo;
    private UUID companyId;
    private String companyName;
    private UUID memberId;
    private String memberName;
    private UUID templateId;
    private String status;
    private String recipientName;
    private String recipientPhone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private String rejectReason;
    private String cardDataJson;
    private String productOptionSummary;
    private String carrierCode;
    private String trackingNumber;
    private Instant createdAt;
}
