package kr.co.tobetheone.ncms.member.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.department.domain.Department;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@DynamicInsert
public class Member extends BaseEntity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    public void updateInfo(String name, String email, String phone, Department department, String status) {
        if (name != null)
            this.name = name;
        if (email != null)
            this.email = email;
        if (phone != null)
            this.phone = phone;
        if (department != null)
            this.department = department;
        if (status != null)
            this.status = status;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
