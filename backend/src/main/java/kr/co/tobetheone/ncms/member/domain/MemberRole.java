package kr.co.tobetheone.ncms.member.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

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
    private Long memberId;

    @Id
    @Column(name = "role_id")
    private Long roleId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class MemberRoleId implements Serializable {
        private static final long serialVersionUID = 1L;

        private Long memberId;
        private Long roleId;
    }
}
