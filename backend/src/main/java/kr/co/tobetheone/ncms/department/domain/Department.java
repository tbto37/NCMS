package kr.co.tobetheone.ncms.department.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
