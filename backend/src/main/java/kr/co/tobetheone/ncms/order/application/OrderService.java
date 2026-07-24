package kr.co.tobetheone.ncms.order.application;

import kr.co.tobetheone.ncms.approval.domain.OrderApproval;
import kr.co.tobetheone.ncms.approval.domain.OrderApprovalRepository;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.domain.MemberRepository;
import kr.co.tobetheone.ncms.order.api.dto.CreateOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.api.dto.RejectOrderRequest;
import kr.co.tobetheone.ncms.order.domain.Order;
import kr.co.tobetheone.ncms.order.domain.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CompanyRepository companyRepository;
    private final MemberRepository memberRepository;
    private final OrderApprovalRepository orderApprovalRepository;

    @Transactional
    public OrderResponse createOrder(UUID memberId, UUID companyId, CreateOrderRequest request) {
        Member requester = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("주문자를 찾을 수 없습니다."));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));

        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmssSSS"));

        Order.ApprovalStatus initialApprovalStatus = (company.getApprovalPolicy() == Company.ApprovalPolicy.NOT_REQUIRED)
                ? Order.ApprovalStatus.NOT_REQUIRED
                : Order.ApprovalStatus.PENDING;

        Order.ProductionStatus initialProductionStatus = (initialApprovalStatus == Order.ApprovalStatus.NOT_REQUIRED)
                ? Order.ProductionStatus.RECEIVED
                : Order.ProductionStatus.DRAFT;

        Order order = Order.builder()
                .company(company)
                .requesterMember(requester)
                .requesterDepartment(requester.getDepartment())
                .orderNumber(orderNumber)
                .approvalStatus(initialApprovalStatus)
                .productionStatus(initialProductionStatus)
                .shippingRecipient(request.getShippingRecipient())
                .shippingPhone(request.getShippingPhone())
                .shippingPostalCode(request.getShippingPostalCode())
                .shippingAddress(request.getShippingAddress())
                .shippingAddressDetail(request.getShippingAddressDetail())
                .orderMemo(request.getOrderMemo())
                .totalAmount(request.getTotalAmount())
                .taxAmount(request.getTaxAmount())
                .grandTotal(request.getGrandTotal())
                .submittedAt(Instant.now())
                .build();

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCompany(UUID companyId) {
        return orderRepository.findByCompanyId(companyId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByMember(UUID memberId) {
        return orderRepository.findByRequesterMemberId(memberId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForOperator() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse approveOrder(UUID orderId, UUID approverMemberId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        Member approver = memberRepository.findById(approverMemberId).orElse(null);

        Order updatedOrder = Order.builder()
                .id(order.getId())
                .company(order.getCompany())
                .requesterMember(order.getRequesterMember())
                .requesterDepartment(order.getRequesterDepartment())
                .orderNumber(order.getOrderNumber())
                .idempotencyKey(order.getIdempotencyKey())
                .approvalStatus(Order.ApprovalStatus.APPROVED)
                .productionStatus(Order.ProductionStatus.RECEIVED)
                .submittedAt(order.getSubmittedAt())
                .approvedAt(Instant.now())
                .rejectedAt(order.getRejectedAt())
                .shippingRecipient(order.getShippingRecipient())
                .shippingPhone(order.getShippingPhone())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingAddress(order.getShippingAddress())
                .shippingAddressDetail(order.getShippingAddressDetail())
                .orderMemo(order.getOrderMemo())
                .totalAmount(order.getTotalAmount())
                .taxAmount(order.getTaxAmount())
                .grandTotal(order.getGrandTotal())
                .version(order.getVersion())
                .build();

        Order saved = orderRepository.save(updatedOrder);

        orderApprovalRepository.save(OrderApproval.builder()
                .order(saved)
                .approverMember(approver)
                .action(OrderApproval.Action.APPROVED)
                .actionAt(Instant.now())
                .build());

        return OrderResponse.from(saved);
    }

    @Transactional
    public OrderResponse rejectOrder(UUID orderId, UUID rejecterMemberId, RejectOrderRequest request) {
        if (request.getRejectReason() == null || request.getRejectReason().isBlank()) {
            throw new IllegalArgumentException("반려 사유는 필수 입력 사항입니다.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        Member rejecter = memberRepository.findById(rejecterMemberId).orElse(null);

        Order updatedOrder = Order.builder()
                .id(order.getId())
                .company(order.getCompany())
                .requesterMember(order.getRequesterMember())
                .requesterDepartment(order.getRequesterDepartment())
                .orderNumber(order.getOrderNumber())
                .idempotencyKey(order.getIdempotencyKey())
                .approvalStatus(Order.ApprovalStatus.REJECTED)
                .productionStatus(order.getProductionStatus())
                .submittedAt(order.getSubmittedAt())
                .approvedAt(order.getApprovedAt())
                .rejectedAt(Instant.now())
                .shippingRecipient(order.getShippingRecipient())
                .shippingPhone(order.getShippingPhone())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingAddress(order.getShippingAddress())
                .shippingAddressDetail(order.getShippingAddressDetail())
                .orderMemo(order.getOrderMemo())
                .totalAmount(order.getTotalAmount())
                .taxAmount(order.getTaxAmount())
                .grandTotal(order.getGrandTotal())
                .version(order.getVersion())
                .build();

        Order saved = orderRepository.save(updatedOrder);

        orderApprovalRepository.save(OrderApproval.builder()
                .order(saved)
                .approverMember(rejecter)
                .action(OrderApproval.Action.REJECTED)
                .rejectReason(request.getRejectReason())
                .actionAt(Instant.now())
                .build());

        return OrderResponse.from(saved);
    }

    @Transactional
    public OrderResponse updateProductionStatus(UUID orderId, Order.ProductionStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        Order updatedOrder = Order.builder()
                .id(order.getId())
                .company(order.getCompany())
                .requesterMember(order.getRequesterMember())
                .requesterDepartment(order.getRequesterDepartment())
                .orderNumber(order.getOrderNumber())
                .idempotencyKey(order.getIdempotencyKey())
                .approvalStatus(order.getApprovalStatus())
                .productionStatus(status)
                .submittedAt(order.getSubmittedAt())
                .approvedAt(order.getApprovedAt())
                .rejectedAt(order.getRejectedAt())
                .shippingRecipient(order.getShippingRecipient())
                .shippingPhone(order.getShippingPhone())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingAddress(order.getShippingAddress())
                .shippingAddressDetail(order.getShippingAddressDetail())
                .orderMemo(order.getOrderMemo())
                .totalAmount(order.getTotalAmount())
                .taxAmount(order.getTaxAmount())
                .grandTotal(order.getGrandTotal())
                .version(order.getVersion())
                .build();

        return OrderResponse.from(orderRepository.save(updatedOrder));
    }
}
