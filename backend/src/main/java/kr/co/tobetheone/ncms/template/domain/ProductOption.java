package kr.co.tobetheone.ncms.template.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

@Entity
@Table(name = "product_options")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductOption extends BaseEntity {

    @Id
    private String id;

    @Column(nullable = false, length = 20)
    private String category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
