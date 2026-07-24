package kr.co.tobetheone.ncms.global.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

@Getter
public class NcmsUserDetails implements UserDetails {

    private final UUID memberId;
    private final String username;
    private final String password;
    private final UUID companyId;
    private final Collection<? extends GrantedAuthority> authorities;

    public NcmsUserDetails(UUID memberId, String username, String password, UUID companyId, Collection<? extends GrantedAuthority> authorities) {
        this.memberId = memberId;
        this.username = username;
        this.password = password;
        this.companyId = companyId;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
