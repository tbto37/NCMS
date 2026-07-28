package kr.co.tobetheone.ncms.global.config;

import kr.co.tobetheone.ncms.global.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,https://ncms-production.up.railway.app,http://ncms-production.up.railway.app,https://ncms-omega.vercel.app}")
    private String allowedOriginsConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 1. Public Endpoints
                .requestMatchers("/api/v1/health").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/auth/login").permitAll()

                // 2. Company & Department & Member Details (Fine-grained Role Access)
                .requestMatchers(HttpMethod.GET, "/api/v1/company/templates").hasAnyRole("EMPLOYEE", "COMPANY_ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.GET, "/api/v1/company/departments").hasAnyRole("EMPLOYEE", "COMPANY_ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/company/departments").hasAnyRole("COMPANY_ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/company/members").hasRole("COMPANY_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/company/members").hasAnyRole("COMPANY_ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/company/members/**").hasAnyRole("COMPANY_ADMIN", "OPERATOR")

                // 3. Admin & Operator & Orders
                .requestMatchers("/api/v1/admin/**").hasRole("SYSTEM_ADMIN")
                .requestMatchers("/api/v1/operator/**").hasAnyRole("OPERATOR")
                .requestMatchers("/api/v1/orders/**").hasAnyRole("EMPLOYEE", "COMPANY_ADMIN", "OPERATOR")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(s -> s.trim())
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
