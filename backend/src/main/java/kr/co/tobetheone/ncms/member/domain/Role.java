package kr.co.tobetheone.ncms.member.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    public enum RoleCode {
        EMPLOYEE("EMPLOYEE"),
        COMPANY_ADMIN("COMPANY_ADMIN"),
        OPERATOR("OPERATOR"),
        SYSTEM_ADMIN("SYSTEM_ADMIN");

        private final String value;

        RoleCode(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
