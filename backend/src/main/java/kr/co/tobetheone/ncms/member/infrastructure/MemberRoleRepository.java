package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRoleRepository extends JpaRepository<MemberRole, MemberRole.MemberRoleId> {
    List<MemberRole> findByMemberId(Long memberId);
}
