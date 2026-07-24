package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.MemberRole;
import kr.co.tobetheone.ncms.member.domain.MemberRoleRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaMemberRoleRepository extends JpaRepository<MemberRole, UUID>, MemberRoleRepository {
    @Override
    List<MemberRole> findByMemberId(UUID memberId);

    @Override
    void deleteByMemberId(UUID memberId);
}
