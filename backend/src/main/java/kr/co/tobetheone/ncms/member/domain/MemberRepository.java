package kr.co.tobetheone.ncms.member.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository {

    Optional<Member> findById(UUID id);

    Optional<Member> findByUsername(String username);

    List<Member> findByCompanyId(UUID companyId);

    List<Member> findAll();

    Member save(Member member);

    boolean existsByUsername(String username);
}
