package kr.co.tobetheone.ncms.company.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "site_code", nullable = false, unique = true, length = 50)
    private String siteCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "primary_color", length = 10)
    private String primaryColor;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
