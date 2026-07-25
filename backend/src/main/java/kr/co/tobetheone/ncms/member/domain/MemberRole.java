package kr.co.tobetheone.ncms.member.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "member_roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@IdClass(MemberRole.MemberRoleId.class)
public class MemberRole {

    @Id
    @Column(name = "member_id")
    private UUID memberId;

    @Id
    @Column(name = "role_id")
    private UUID roleId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberRoleId implements Serializable {
        private static final long serialVersionUID = 1L;

        private UUID memberId;
        private UUID roleId;
    }
}
