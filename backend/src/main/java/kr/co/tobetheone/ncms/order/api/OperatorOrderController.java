package kr.co.tobetheone.ncms.order.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.api.dto.RejectOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.UpdateOrderStatusRequest;
import kr.co.tobetheone.ncms.order.application.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operator/orders")
@RequiredArgsConstructor
public class OperatorOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<List<OrderResponse>> getOperatorOrders() {
        return ApiResponse.success(orderService.getOperatorOrders());
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<OrderResponse> approveOrder(@PathVariable String id) {
        return ApiResponse.success(orderService.approveOrder(id));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<OrderResponse> rejectOrder(
            @PathVariable String id,
            @RequestBody RejectOrderRequest request) {
        return ApiResponse.success(orderService.rejectOrder(id, request.getReason()));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable String id,
            @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success(orderService.updateOrderStatus(id, request.getStatus(), request.getCarrierCode(),
                request.getTrackingNumber()));
    }
}
