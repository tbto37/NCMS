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

    @Column(name = "material_name", nullable = false, length = 100)
    private String materialName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
