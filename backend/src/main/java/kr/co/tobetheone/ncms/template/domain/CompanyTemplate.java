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
    @Column(name = "company_id", length = 50)
    private String companyId;

    @Id
    @Column(name = "template_id", length = 50)
    private String templateId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyTemplateId implements Serializable {
        private static final long serialVersionUID = 1L;

        private String companyId;
        private String templateId;
    }
}
