package kr.co.tobetheone.ncms.health.api;

import kr.co.tobetheone.ncms.global.response.ApiResponse;
import kr.co.tobetheone.ncms.health.api.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> health() {
        HealthResponse healthResponse = HealthResponse.builder()
                .status("UP")
                .timestamp(Instant.now())
                .application("NCMS Backend")
                .version("0.0.1-SNAPSHOT")
                .build();

        return ResponseEntity.ok(ApiResponse.success(healthResponse));
    }
}
