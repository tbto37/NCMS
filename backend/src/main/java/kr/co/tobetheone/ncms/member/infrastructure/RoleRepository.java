package kr.co.tobetheone.ncms.member.infrastructure;

import kr.co.tobetheone.ncms.member.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCode(String code);
}
