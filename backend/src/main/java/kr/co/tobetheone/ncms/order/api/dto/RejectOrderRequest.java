package kr.co.tobetheone.ncms.order.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RejectOrderRequest {
    private String reason;
}
