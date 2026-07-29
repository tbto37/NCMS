package kr.co.tobetheone.ncms.template.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

@Entity
@Table(name = "templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Template extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "preview_front_url", length = 500)
    private String previewFrontUrl;

    @Column(name = "preview_back_url", length = 500)
    private String previewBackUrl;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
