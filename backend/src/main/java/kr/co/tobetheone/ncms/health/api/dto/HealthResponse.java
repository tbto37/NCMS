package kr.co.tobetheone.ncms.health.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HealthResponse {
    private String status;
    private String service;
    private String version;
    private LocalDateTime timestamp;
}
