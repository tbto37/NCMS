package kr.co.tobetheone.ncms.member.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "korean_name", nullable = false, length = 100)
    private String koreanName;

    @Column(name = "english_name", length = 100)
    private String englishName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String mobile;

    @Column(name = "office_phone", length = 20)
    private String officePhone;

    @Column(length = 100)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberStatus status;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_password_changed_at")
    private Instant lastPasswordChangedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public enum MemberStatus {
        ACTIVE, INACTIVE, LOCKED
    }
}
