package kr.co.tobetheone.ncms.global.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
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

                String memberId = memberIdStr;
                String companyId = companyIdStr;

                var authorities = roles != null
                        ? roles.stream().map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                                .map(SimpleGrantedAuthority::new).collect(Collectors.toList())
                        : List.<SimpleGrantedAuthority>of();

                NcmsUserDetails userDetails = new NcmsUserDetails(memberId, username, "", companyId, authorities);

                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
