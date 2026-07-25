package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByCode(String code);
}
