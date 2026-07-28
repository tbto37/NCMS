package kr.co.tobetheone.ncms.global.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class NcmsUserDetails implements UserDetails {

    private static final long serialVersionUID = 1L;

    private final String memberId;
    private final String username;
    private final String password;
    private final String companyId;
    private final transient Collection<? extends GrantedAuthority> authorities;

    public NcmsUserDetails(String memberId, String username, String password, String companyId,
            Collection<? extends GrantedAuthority> authorities) {
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
