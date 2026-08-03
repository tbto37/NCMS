package kr.co.tobetheone.ncms.order.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelUploadResultDto {
    private int successCount;
    private int failCount;
    private List<UploadFailure> failures;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadFailure {
        private String orderNo;
        private String name;
        private String reason;
    }
}
