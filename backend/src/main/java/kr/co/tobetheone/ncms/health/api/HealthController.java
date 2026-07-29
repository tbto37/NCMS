package kr.co.tobetheone.ncms.health.api;

import kr.co.tobetheone.ncms.health.api.dto.HealthResponse;
import kr.co.tobetheone.ncms.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ApiResponse<HealthResponse> healthCheck() {
        HealthResponse response = HealthResponse.builder()
                .status("UP")
                .service("NCMS Backend API")
                .version("0.1.0")
                .timestamp(LocalDateTime.now())
                .build();
        return ApiResponse.success(response);
    }
}
