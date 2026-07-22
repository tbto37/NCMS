package kr.co.tobetheone.ncms.company.domain;

import jakarta.persistence.*;
import kr.co.tobetheone.ncms.global.domain.BaseEntity;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "site_code", unique = true, length = 50)
    private String siteCode;

    @Column(name = "logo_file_key", length = 500)
    private String logoFileKey;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_policy", nullable = false, length = 20)
    private ApprovalPolicy approvalPolicy;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_address_policy", nullable = false, length = 20)
    private ShippingAddressPolicy shippingAddressPolicy;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_visibility", nullable = false, length = 20)
    private PriceVisibility priceVisibility;

    @Column(name = "default_shipping_recipient", length = 100)
    private String defaultShippingRecipient;

    @Column(name = "default_shipping_phone", length = 20)
    private String defaultShippingPhone;

    @Column(name = "default_shipping_postal_code", length = 10)
    private String defaultShippingPostalCode;

    @Column(name = "default_shipping_address", length = 500)
    private String defaultShippingAddress;

    @Column(name = "default_shipping_address_detail", length = 500)
    private String defaultShippingAddressDetail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompanyStatus status;

    @Column(name = "deleted_at")
    private java.time.Instant deletedAt;

    public enum ApprovalPolicy {
        NOT_REQUIRED, REQUIRED
    }

    public enum ShippingAddressPolicy {
        FIXED, USER_INPUT, BOTH
    }

    public enum PriceVisibility {
        VISIBLE, HIDDEN
    }

    public enum CompanyStatus {
        ACTIVE, INACTIVE
    }
}
