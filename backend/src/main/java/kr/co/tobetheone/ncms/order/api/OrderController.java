package kr.co.tobetheone.ncms.order.api;

import jakarta.validation.Valid;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.global.security.NcmsUserDetails;
import kr.co.tobetheone.ncms.order.api.dto.CreateOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.application.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal NcmsUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderResponse response = orderService.createOrder(userDetails.getMemberId(), userDetails.getCompanyId(), request);
        return ResponseEntity.ok(ApiResponse.success("주문이 성공적으로 접수되었습니다.", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'COMPANY_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @AuthenticationPrincipal NcmsUserDetails userDetails
    ) {
        List<OrderResponse> orders;
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY_ADMIN") || a.getAuthority().equals("ROLE_SYSTEM_ADMIN"))) {
            orders = orderService.getOrdersByCompany(userDetails.getCompanyId());
        } else {
            orders = orderService.getOrdersByMember(userDetails.getMemberId());
        }
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'COMPANY_ADMIN', 'OPERATOR', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable("id") UUID id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
