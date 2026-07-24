package kr.co.tobetheone.ncms.approval.infrastructure;

import kr.co.tobetheone.ncms.approval.domain.OrderApproval;
import kr.co.tobetheone.ncms.approval.domain.OrderApprovalRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaOrderApprovalRepository extends JpaRepository<OrderApproval, UUID>, OrderApprovalRepository {
    @Override
    List<OrderApproval> findByOrderId(UUID orderId);
}
