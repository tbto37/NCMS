package kr.co.tobetheone.ncms.global.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class TenantResolverInterceptor implements HandlerInterceptor {

    private final CompanyRepository companyRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String companyCode = request.getHeader("X-Company-Code");

        if (companyCode != null && !companyCode.isBlank()) {
            companyRepository.findBySiteCode(companyCode).ifPresent(company -> {
                TenantContext.setCompanyId(company.getId());
            });
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {
        TenantContext.clear();
    }
}
