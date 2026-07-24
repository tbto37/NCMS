package kr.co.tobetheone.ncms.company.application;

import kr.co.tobetheone.ncms.company.api.dto.CreateCompanyRequest;
import kr.co.tobetheone.ncms.company.api.dto.PublicCompanyResponse;
import kr.co.tobetheone.ncms.company.domain.Company;
import kr.co.tobetheone.ncms.company.domain.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<PublicCompanyResponse> getAllCompanies() {
        return companyRepository.findBySiteCodeAndStatus("", Company.CompanyStatus.ACTIVE)
                .stream()
                .map(PublicCompanyResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PublicCompanyResponse createCompany(CreateCompanyRequest request) {
        if (companyRepository.findBySiteCode(request.getSiteCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사이트 코드입니다: " + request.getSiteCode());
        }

        Company company = Company.builder()
                .siteCode(request.getSiteCode())
                .name(request.getName())
                .logoFileKey(request.getLogoFileKey())
                .primaryColor(request.getPrimaryColor() != null ? request.getPrimaryColor() : "#0052CC")
                .approvalPolicy(request.getApprovalPolicy() != null ? request.getApprovalPolicy() : Company.ApprovalPolicy.NOT_REQUIRED)
                .shippingAddressPolicy(request.getShippingAddressPolicy() != null ? request.getShippingAddressPolicy() : Company.ShippingAddressPolicy.BOTH)
                .priceVisibility(request.getPriceVisibility() != null ? request.getPriceVisibility() : Company.PriceVisibility.HIDDEN)
                .status(Company.CompanyStatus.ACTIVE)
                .build();

        return PublicCompanyResponse.from(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public PublicCompanyResponse getCompanyById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));
        return PublicCompanyResponse.from(company);
    }
}
