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
import kr.co.tobetheone.ncms.global.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    private final EmailService emailService;

    @Transactional
    public OrderResponse createOrder(Long memberId, CreateOrderRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Company company = member.getCompany();
        if (company == null) {
            throw new CustomException("소속 고객사가 존재하지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        Template template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new CustomException("템플릿을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        String orderNo = generateOrderNo();

        Order order = Order.builder()
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
                .memo(request.getMemo())
                .build();

        order = orderRepository.save(order);

        OrderSnapshot snapshot = OrderSnapshot.builder()
                .order(order)
                .cardData(request.getCardDataJson() != null ? request.getCardDataJson() : "{}")
                .productOptionSummary(request.getProductOptionSummary())
                .previewFrontUrl(template.getPreviewFrontUrl())
                .previewBackUrl(template.getPreviewBackUrl())
                .build();

        orderSnapshotRepository.save(snapshot);

        return toResponse(order);
    }

    public List<OrderResponse> getOrdersByCompany(Long companyId) {
        return toResponseList(orderRepository.findByCompanyIdOrderByCreatedAtDesc(companyId));
    }

    public List<OrderResponse> getOrdersByMember(Long memberId) {
        return toResponseList(orderRepository.findByMemberIdOrderByCreatedAtDesc(memberId));
    }

    public List<OrderResponse> getOperatorOrders() {
        return toResponseList(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    public OrderResponse getOrderDetails(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse approveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        order.approve();
        emailService.sendApprovalNotification(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse rejectOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        order.reject(reason);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status, String carrierCode, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        order.updateStatus(status);

        if (carrierCode != null && trackingNumber != null) {
            Shipment shipment = shipmentRepository.findByOrderId(orderId)
                    .orElseGet(() -> Shipment.builder().order(order).carrierCode(carrierCode)
                            .trackingNumber(trackingNumber).build());
            shipmentRepository.save(shipment);
        }

        return toResponse(order);
    }

    @Transactional
    public kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto processExcelShipmentUpload(List<kr.co.tobetheone.ncms.order.api.dto.ShipmentExcelRowDto> rows) {
        int successCount = 0;
        List<kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto.UploadFailure> failures = new java.util.ArrayList<>();

        for (kr.co.tobetheone.ncms.order.api.dto.ShipmentExcelRowDto row : rows) {
            String orderNo = row.getOrderNo() != null ? row.getOrderNo().trim() : "";
            String name = row.getName() != null ? row.getName().trim().replace(" ", "") : "";
            String trackingNumber = row.getTrackingNumber() != null ? row.getTrackingNumber().trim() : "";
            String carrierCode = row.getCarrierCode() != null && !row.getCarrierCode().isBlank() ? row.getCarrierCode().trim() : "롯데택배";

            if (orderNo.isBlank() || trackingNumber.isBlank()) {
                failures.add(new kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto.UploadFailure(orderNo, name, "주문번호 또는 송장번호가 누락되었습니다."));
                continue;
            }

            java.util.Optional<Order> orderOpt = orderRepository.findByOrderNo(orderNo);
            if (orderOpt.isEmpty()) {
                failures.add(new kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto.UploadFailure(orderNo, name, "존재하지 않는 주문번호입니다."));
                continue;
            }

            Order order = orderOpt.get();
            String recipientName = order.getRecipientName() != null ? order.getRecipientName().trim().replace(" ", "") : "";
            String memberName = order.getMember() != null && order.getMember().getName() != null ? order.getMember().getName().trim().replace(" ", "") : "";

            // 주문번호 + 이름 2가지 조건 동시 검증
            boolean nameMatches = name.equalsIgnoreCase(recipientName) || name.equalsIgnoreCase(memberName);
            if (!nameMatches) {
                failures.add(new kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto.UploadFailure(orderNo, name, "주문번호와 이름이 일치하지 않습니다. (시스템 기록 수령인: " + order.getRecipientName() + ")"));
                continue;
            }

            order.updateStatus("SHIPPED");

            Shipment shipment = shipmentRepository.findByOrderId(order.getId())
                    .orElseGet(() -> Shipment.builder().order(order).carrierCode(carrierCode).trackingNumber(trackingNumber).build());
            shipmentRepository.save(shipment);

            successCount++;
        }

        return kr.co.tobetheone.ncms.order.api.dto.ExcelUploadResultDto.builder()
                .successCount(successCount)
                .failCount(failures.size())
                .failures(failures)
                .build();
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        orderSnapshotRepository.findByOrderId(orderId).ifPresent(orderSnapshotRepository::delete);
        shipmentRepository.findByOrderId(orderId).ifPresent(shipmentRepository::delete);
        orderRepository.delete(order);
    }

    private List<OrderResponse> toResponseList(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return List.of();
        }
        List<Long> orderIds = orders.stream().map(order -> order.getId()).toList();

        java.util.Map<Long, OrderSnapshot> snapshotMap = orderSnapshotRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.toMap(s -> s.getOrder().getId(), s -> s, (s1, s2) -> s1));

        java.util.Map<Long, Shipment> shipmentMap = shipmentRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.toMap(s -> s.getOrder().getId(), s -> s, (s1, s2) -> s1));

        return orders.stream()
                .map(order -> {
                    OrderSnapshot snapshot = snapshotMap.get(order.getId());
                    Shipment shipment = shipmentMap.get(order.getId());
                    return OrderResponse.builder()
                            .id(order.getId())
                            .orderNo(order.getOrderNo())
                            .companyId(order.getCompany().getId())
                            .companyName(order.getCompany().getName())
                            .memberId(order.getMember().getId())
                            .memberName(order.getMember().getName())
                            .memberEmail(order.getMember() != null ? order.getMember().getEmail() : null)
                            .templateId(order.getTemplate().getId())
                            .templateName(order.getTemplate() != null ? order.getTemplate().getName() : null)
                            .status(order.getStatus())
                            .recipientName(order.getRecipientName())
                            .recipientPhone(order.getRecipientPhone())
                            .zipcode(order.getZipcode())
                            .address(order.getAddress())
                            .addressDetail(order.getAddressDetail())
                            .memo(order.getMemo())
                            .rejectReason(order.getRejectReason())
                            .cardDataJson(snapshot != null ? snapshot.getCardData() : null)
                            .productOptionSummary(snapshot != null ? snapshot.getProductOptionSummary() : null)
                            .carrierCode(shipment != null ? shipment.getCarrierCode() : null)
                            .trackingNumber(shipment != null ? shipment.getTrackingNumber() : null)
                            .createdAt(order.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
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
                .memberEmail(order.getMember() != null ? order.getMember().getEmail() : null)
                .templateId(order.getTemplate().getId())
                .templateName(order.getTemplate() != null ? order.getTemplate().getName() : null)
                .status(order.getStatus())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .zipcode(order.getZipcode())
                .address(order.getAddress())
                .addressDetail(order.getAddressDetail())
                .memo(order.getMemo())
                .rejectReason(order.getRejectReason())
                .cardDataJson(snapshot != null ? snapshot.getCardData() : null)
                .productOptionSummary(snapshot != null ? snapshot.getProductOptionSummary() : null)
                .carrierCode(shipment != null ? shipment.getCarrierCode() : null)
                .trackingNumber(shipment != null ? shipment.getTrackingNumber() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private synchronized String generateOrderNo() {
        long count = orderRepository.count();
        long seq = count + 1;
        String candidate;
        do {
            candidate = String.format("%05d", seq++);
        } while (orderRepository.existsByOrderNo(candidate));

        return candidate;
    }
}
