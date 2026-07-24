package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.Role;
import kr.co.tobetheone.ncms.member.domain.RoleRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaRoleRepository extends JpaRepository<Role, UUID>, RoleRepository {
    @Override
    Optional<Role> findByCode(String code);
}
