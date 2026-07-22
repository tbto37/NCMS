package kr.co.tobetheone.ncms.department.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parentDepartment;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "full_path", length = 500)
    private String fullPath;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DepartmentStatus status;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public enum DepartmentStatus {
        ACTIVE, INACTIVE
    }
}
