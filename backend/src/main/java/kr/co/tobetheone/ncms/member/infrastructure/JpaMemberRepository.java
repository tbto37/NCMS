package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.Member;
import kr.co.tobetheone.ncms.member.domain.MemberRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaMemberRepository extends JpaRepository<Member, UUID>, MemberRepository {

    @Override
    Optional<Member> findByUsername(String username);

    @Override
    List<Member> findByCompanyId(UUID companyId);

    @Override
    boolean existsByUsername(String username);
}
