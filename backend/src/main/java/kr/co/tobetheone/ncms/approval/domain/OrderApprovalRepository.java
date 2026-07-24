package kr.co.tobetheone.ncms.approval.domain;

import java.util.List;
import java.util.UUID;

public interface OrderApprovalRepository {
    List<OrderApproval> findByOrderId(UUID orderId);
    OrderApproval save(OrderApproval orderApproval);
}
