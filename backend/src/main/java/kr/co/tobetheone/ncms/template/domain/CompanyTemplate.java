package kr.co.tobetheone.ncms.template.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "company_templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@IdClass(CompanyTemplate.CompanyTemplateId.class)
public class CompanyTemplate {

    @Id
    @Column(name = "company_id")
    private Long companyId;

    @Id
    @Column(name = "template_id")
    private Long templateId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyTemplateId implements Serializable {
        private static final long serialVersionUID = 1L;

        private Long companyId;
        private Long templateId;
    }
}
