package kr.co.tobetheone.ncms.global.config;

import kr.co.tobetheone.ncms.global.tenant.TenantResolverInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final TenantResolverInterceptor tenantResolverInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantResolverInterceptor)
                .addPathPatterns("/api/**");
    }
}
