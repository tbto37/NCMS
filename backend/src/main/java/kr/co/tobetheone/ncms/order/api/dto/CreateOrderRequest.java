package kr.co.tobetheone.ncms.order.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class CreateOrderRequest {

    private UUID templateId;

    @NotBlank(message = "수령인 이름은 필수입니다.")
    private String shippingRecipient;

    @NotBlank(message = "수령인 연락처는 필수입니다.")
    private String shippingPhone;

    @NotBlank(message = "우편번호는 필수입니다.")
    private String shippingPostalCode;

    @NotBlank(message = "기본주소는 필수입니다.")
    private String shippingAddress;

    private String shippingAddressDetail;
    private String orderMemo;

    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
}
