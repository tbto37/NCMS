package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateOrderRequest {
    private Long templateId;
    private String recipientName;
    private String recipientPhone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private String cardDataJson;
    private String productOptionSummary;
}
