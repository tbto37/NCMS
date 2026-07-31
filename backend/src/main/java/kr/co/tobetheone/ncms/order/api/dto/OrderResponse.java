package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String orderNo;
    private Long companyId;
    private String companyName;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private Long templateId;
    private String templateName;
    private String status;
    private String recipientName;
    private String recipientPhone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private String memo;
    private String rejectReason;
    private String cardDataJson;
    private String productOptionSummary;
    private String carrierCode;
    private String trackingNumber;
    private LocalDateTime createdAt;
}
