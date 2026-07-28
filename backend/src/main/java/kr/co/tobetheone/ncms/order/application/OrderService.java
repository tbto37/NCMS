package kr.co.tobetheone.ncms.order.application;

import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.global.exception.CustomException;
import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.infrastructure.MemberRepository;
import kr.co.tobetheone.ncms.order.api.dto.CreateOrderRequest;
import kr.co.tobetheone.ncms.order.api.dto.OrderResponse;
import kr.co.tobetheone.ncms.order.domain.Order;
import kr.co.tobetheone.ncms.order.domain.OrderSnapshot;
import kr.co.tobetheone.ncms.order.infrastructure.OrderRepository;
import kr.co.tobetheone.ncms.order.infrastructure.OrderSnapshotRepository;
import kr.co.tobetheone.ncms.shipment.domain.Shipment;
import kr.co.tobetheone.ncms.shipment.infrastructure.ShipmentRepository;
import kr.co.tobetheone.ncms.template.domain.Template;
import kr.co.tobetheone.ncms.template.infrastructure.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderSnapshotRepository orderSnapshotRepository;
    private final ShipmentRepository shipmentRepository;
    private final MemberRepository memberRepository;
    private final TemplateRepository templateRepository;

    @Transactional
    public OrderResponse createOrder(String memberId, CreateOrderRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Company company = member.getCompany();
        if (company == null) {
            throw new CustomException("소속 고객사가 존재하지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        Template template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new CustomException("템플릿을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        String orderNo = generateOrderNo();
        String orderId = "O_" + System.currentTimeMillis();

        Order order = Order.builder()
                .id(orderId)
                .orderNo(orderNo)
                .company(company)
                .member(member)
                .template(template)
                .status("PENDING")
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .build();

        order = orderRepository.save(order);

        String snapshotId = "S_" + System.currentTimeMillis();
        OrderSnapshot snapshot = OrderSnapshot.builder()
                .id(snapshotId)
                .order(order)
                .cardData(request.getCardDataJson() != null ? request.getCardDataJson() : "{}")
                .productOptionSummary(request.getProductOptionSummary())
                .previewFrontUrl(template.getPreviewFrontUrl())
                .previewBackUrl(template.getPreviewBackUrl())
                .build();

        orderSnapshotRepository.save(snapshot);

        return toResponse(order);
    }

    public List<OrderResponse> getOrdersByCompany(String companyId) {
        return orderRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByMember(String memberId) {
        return orderRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOperatorOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderDetails(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse approveOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        order.approve();
        return toResponse(order);
    }

    @Transactional
    public OrderResponse rejectOrder(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        order.reject(reason);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String status, String carrierCode, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        order.updateStatus(status);

        if (carrierCode != null && trackingNumber != null) {
            String shipmentId = "SHP_" + System.currentTimeMillis();
            Shipment shipment = shipmentRepository.findByOrderId(orderId)
                    .orElseGet(() -> Shipment.builder().id(shipmentId).order(order).carrierCode(carrierCode)
                            .trackingNumber(trackingNumber).build());
            shipmentRepository.save(shipment);
        }

        return toResponse(order);
    }

    @Transactional
    public void deleteOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        orderSnapshotRepository.findByOrderId(orderId).ifPresent(orderSnapshotRepository::delete);
        shipmentRepository.findByOrderId(orderId).ifPresent(shipmentRepository::delete);
        orderRepository.delete(order);
    }

    private OrderResponse toResponse(Order order) {
        OrderSnapshot snapshot = orderSnapshotRepository.findByOrderId(order.getId()).orElse(null);
        Shipment shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);

        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .companyId(order.getCompany().getId())
                .companyName(order.getCompany().getName())
                .memberId(order.getMember().getId())
                .memberName(order.getMember().getName())
                .templateId(order.getTemplate().getId())
                .status(order.getStatus())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .zipcode(order.getZipcode())
                .address(order.getAddress())
                .addressDetail(order.getAddressDetail())
                .rejectReason(order.getRejectReason())
                .cardDataJson(snapshot != null ? snapshot.getCardData() : null)
                .productOptionSummary(snapshot != null ? snapshot.getProductOptionSummary() : null)
                .carrierCode(shipment != null ? shipment.getCarrierCode() : null)
                .trackingNumber(shipment != null ? shipment.getTrackingNumber() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private String generateOrderNo() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + datePrefix + "-" + randomSuffix;
    }
}
