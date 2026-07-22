package com.logcom.ncms.domain.health.controller;

import com.logcom.ncms.common.dto.ApiResponse;
import com.logcom.ncms.domain.health.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> health() {
        HealthResponse healthResponse = HealthResponse.builder()
                .status("UP")
                .timestamp(LocalDateTime.now())
                .application("NCMS Backend")
                .version("0.0.1-SNAPSHOT")
                .build();

        return ResponseEntity.ok(ApiResponse.success(healthResponse));
    }
}
