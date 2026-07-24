package kr.co.tobetheone.ncms.order.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.api.dto.RejectOrderRequest;
import kr.co.tobetheone.ncms.order.application.OrderService;
import kr.co.tobetheone.ncms.order.domain.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operator/orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OPERATOR', 'SYSTEM_ADMIN')")
public class OperatorOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOperatorOrders() {
        List<OrderResponse> orders = orderService.getAllOrdersForOperator();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<OrderResponse>> approveOrder(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal NcmsUserDetails userDetails
    ) {
        OrderResponse response = orderService.approveOrder(id, userDetails.getMemberId());
        return ResponseEntity.ok(ApiResponse.success("명함 검수가 승인되었습니다.", response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @Valid @RequestBody RejectOrderRequest request
    ) {
        OrderResponse response = orderService.rejectOrder(id, userDetails.getMemberId(), request);
        return ResponseEntity.ok(ApiResponse.success("명함 검수가 반려되었습니다.", response));
    }

    @PatchMapping("/{id}/production-status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateProductionStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") Order.ProductionStatus status
    ) {
        OrderResponse response = orderService.updateProductionStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("제작 상태가 변경되었습니다.", response));
    }
}
