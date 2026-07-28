package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class OrderResponse {
    private String id;
    private String orderNo;
    private String companyId;
    private String companyName;
    private String memberId;
    private String memberName;
    private String templateId;
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
