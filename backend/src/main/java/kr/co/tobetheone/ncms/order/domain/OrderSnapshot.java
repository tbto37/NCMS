package kr.co.tobetheone.ncms.order.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;

@Entity
@Table(name = "order_snapshots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@DynamicInsert
public class OrderSnapshot {

    @Id
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "card_data", nullable = false, columnDefinition = "jsonb")
    private String cardData;

    @Column(name = "product_option_summary", length = 200)
    private String productOptionSummary;

    @Column(name = "preview_front_url", length = 500)
    private String previewFrontUrl;

    @Column(name = "preview_back_url", length = 500)
    private String previewBackUrl;

    @Column(name = "print_pdf_url", length = 500)
    private String printPdfUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
