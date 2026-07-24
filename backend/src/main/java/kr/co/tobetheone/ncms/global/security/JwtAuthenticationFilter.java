package kr.co.tobetheone.ncms.global.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.tobetheone.ncms.global.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.getClaims(token);
                String username = claims.getSubject();
                String memberIdStr = claims.get("memberId", String.class);
                String companyIdStr = claims.get("companyId", String.class);
                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);

                UUID memberId = memberIdStr != null ? UUID.fromString(memberIdStr) : null;
                UUID companyId = companyIdStr != null ? UUID.fromString(companyIdStr) : null;

                var authorities = roles != null
                        ? roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(Collectors.toList())
                        : List.<SimpleGrantedAuthority>of();

                NcmsUserDetails userDetails = new NcmsUserDetails(memberId, username, "", companyId, authorities);

                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                if (companyId != null) {
                    TenantContext.setCompanyId(companyId);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
