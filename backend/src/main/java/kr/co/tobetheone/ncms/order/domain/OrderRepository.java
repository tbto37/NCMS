package kr.co.tobetheone.ncms.order.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository {
    Optional<Order> findById(UUID id);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCompanyId(UUID companyId);
    List<Order> findByRequesterMemberId(UUID requesterMemberId);
    List<Order> findByApprovalStatus(Order.ApprovalStatus approvalStatus);
    List<Order> findAll();
    Order save(Order order);
}
