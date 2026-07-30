package kr.co.tobetheone.ncms.order.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.order.api.dto.CreateOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.api.dto.RejectOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.UpdateOrderStatusRequest;
import kr.co.tobetheone.ncms.order.application.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @RequestBody CreateOrderRequest request) {
        return ApiResponse.success(orderService.createOrder(userDetails.getMemberId(), request));
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getOrders(@AuthenticationPrincipal NcmsUserDetails userDetails) {
        if (userDetails.getCompanyId() != null) {
            return ApiResponse.success(orderService.getOrdersByCompany(userDetails.getCompanyId()));
        }
        return ApiResponse.success(orderService.getOrdersByMember(userDetails.getMemberId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderDetails(@PathVariable Long id) {
        return ApiResponse.success(orderService.getOrderDetails(id));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<OrderResponse> approveOrder(@PathVariable Long id) {
        return ApiResponse.success(orderService.approveOrder(id));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<OrderResponse> rejectOrder(
            @PathVariable Long id,
            @RequestBody(required = false) RejectOrderRequest request) {
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "검수 반려";
        return ApiResponse.success(orderService.rejectOrder(id, reason));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success(orderService.updateOrderStatus(id, request.getStatus(), request.getCarrierCode(),
                request.getTrackingNumber()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ApiResponse.success(null);
    }
}
