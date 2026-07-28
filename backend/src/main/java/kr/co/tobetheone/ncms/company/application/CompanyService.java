package kr.co.tobetheone.ncms.company.application;

import kr.co.tobetheone.ncms.company.api.dto.CreateCompanyRequest;
import kr.co.tobetheone.ncms.company.api.dto.PublicCompanyResponse;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.infrastructure.CompanyRepository;
import kr.co.tobetheone.ncms.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public PublicCompanyResponse getPublicCompanyInfo(String siteCode) {
        Company company = companyRepository.findBySiteCode(siteCode)
                .orElseThrow(() -> new CustomException("고객사를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return PublicCompanyResponse.builder()
                .id(company.getId())
                .siteCode(company.getSiteCode())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .primaryColor(company.getPrimaryColor())
                .build();
    }

    public Company getCompanyById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new CustomException("고객사를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Company createCompany(CreateCompanyRequest request) {
        if (companyRepository.findBySiteCode(request.getSiteCode()).isPresent()) {
            throw new CustomException("이미 존재하는 사이트 코드입니다.", HttpStatus.BAD_REQUEST);
        }
        String id = "C_" + System.currentTimeMillis();
        Company company = Company.builder()
                .id(id)
                .siteCode(request.getSiteCode())
                .name(request.getName())
                .logoUrl(request.getLogoUrl())
                .primaryColor(request.getPrimaryColor() != null ? request.getPrimaryColor() : "#000000")
                .status("ACTIVE")
                .build();
        return companyRepository.save(company);
    }
}
