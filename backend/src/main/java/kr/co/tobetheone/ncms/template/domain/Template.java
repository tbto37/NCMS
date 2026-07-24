package kr.co.tobetheone.ncms.template.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Template extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_code", unique = true, nullable = false, length = 50)
    private String templateCode;

    @Column(name = "template_name", nullable = false, length = 200)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TemplateStatus status;

    public enum TemplateStatus {
        ACTIVE, INACTIVE
    }
}
