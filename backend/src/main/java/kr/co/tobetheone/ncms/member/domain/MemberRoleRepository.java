package kr.co.tobetheone.ncms.member.domain;

import java.util.List;
import java.util.UUID;

public interface MemberRoleRepository {
    List<MemberRole> findByMemberId(UUID memberId);
    MemberRole save(MemberRole memberRole);
    void deleteByMemberId(UUID memberId);
}
