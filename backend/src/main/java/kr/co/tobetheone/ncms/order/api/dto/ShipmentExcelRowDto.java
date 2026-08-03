package kr.co.tobetheone.ncms.order.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentExcelRowDto {
    private String orderNo;
    private String name;
    private String carrierCode;
    private String trackingNumber;
}
