package kr.co.tobetheone.ncms.member.domain;

import java.util.List;
import java.util.Optional;

public interface RoleRepository {
    Optional<Role> findByCode(String code);

    List<Role> findAll();

    Role save(Role role);
}
