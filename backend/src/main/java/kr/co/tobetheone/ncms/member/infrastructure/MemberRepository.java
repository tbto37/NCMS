package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
    Optional<Member> findByUsername(String username);
    List<Member> findByCompanyId(UUID companyId);
}
