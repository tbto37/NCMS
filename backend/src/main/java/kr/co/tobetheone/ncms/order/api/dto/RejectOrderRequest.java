package kr.co.tobetheone.ncms.order.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RejectOrderRequest {

    @NotBlank(message = "반려 사유는 필수입니다.")
    private String rejectReason;
}
