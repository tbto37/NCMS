package kr.co.tobetheone.ncms.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret:ncmsSecretKeyForJwtAuthenticationSystemMinimum32BytesLong}") String secret,
            @Value("${jwt.access-token-validity-in-seconds:86400}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds:604800}") long refreshTokenValidityInSeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
    }

    public String createAccessToken(UUID memberId, String username, UUID companyId, List<String> roles) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        var builder = Jwts.builder()
                .subject(username)
                .claim("memberId", memberId.toString())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey);

        if (companyId != null) {
            builder.claim("companyId", companyId.toString());
        }

        return builder.compact();
    }

    public String createRefreshToken(UUID memberId, String username) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(username)
                .claim("memberId", memberId.toString())
                .claim("type", "REFRESH")
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
