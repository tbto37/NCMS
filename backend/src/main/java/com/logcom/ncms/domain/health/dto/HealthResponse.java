package com.logcom.ncms.domain.health.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {
    private String status;
    private LocalDateTime timestamp;
    private String application;
    private String version;
}
