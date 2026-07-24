package kr.co.tobetheone.ncms.order.infrastructure;

import kr.co.tobetheone.ncms.order.domain.Order;
import kr.co.tobetheone.ncms.order.domain.OrderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaOrderRepository extends JpaRepository<Order, UUID>, OrderRepository {

    @Override
    Optional<Order> findByOrderNumber(String orderNumber);

    @Override
    List<Order> findByCompanyId(UUID companyId);

    @Override
    List<Order> findByRequesterMemberId(UUID requesterMemberId);

    @Override
    List<Order> findByApprovalStatus(Order.ApprovalStatus approvalStatus);
}
