package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    private String status;
    private String carrierCode;
    private String trackingNumber;
}
