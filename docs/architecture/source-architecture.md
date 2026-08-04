# NCMS 소스 아키텍처 (MVP 간소화 버전)

| 항목 | 내용 |
|---|---|
| 시스템명 | NCMS (NameCard Management System) |
| 저장소명 | `NCMS` |
| 버전 | v0.3 (MVP 간소화) |
| 작성일 | 2026-07-25 |
| 구성 | Spring Boot + React + PostgreSQL 모노레포 |

---

## 1. 저장소 및 프로젝트 구조

NCMS는 하나의 Git 저장소 안에서 백엔드와 프론트엔드를 독립 배포형으로 구성합니다.

```text
NCMS/
├── backend/        # Spring Boot API & Flyway 마이그레이션 (Railway 배포)
├── frontend/       # 역할 기반 단일 React 애플리케이션 (Vercel 배포)
├── docs/           # 기능정의, DB 설계, 아키텍처 등 개발 기준 문서
├── infra/          # 배포 및 로컬 실행 환경 설정
└── scripts/        # 보조 스크립트
```

---

## 2. Backend 패키지 아키텍처 (Spring Boot)

백엔드는 도메인 중심의 다층 레이어 구조(Controller-Service-Repository)를 사용합니다.

```text
kr.co.tobetheone.ncms/
├── global/          # Security, Exception, Common DTO/Response
├── auth/            # 인증 (Login, Token)
├── company/         # 고객사 메타 관리
├── department/      # 부서 관리
├── member/          # 회원 및 권한 관리
├── template/        # 명함 템플릿 및 상품 옵션
├── order/           # 명함 주문 및 스냅샷
├── shipment/        # 배송 관리
└── health/          # 헬스 체크
```

### 2.1 주요 도메인 책임
- `auth`: 로그인, JWT Access Token 발급
- `company`: 고객사 메타(로고, 색상) 관리
- `department`: 부서 목록 및 순서 관리
- `member`: 회원(임직원/기업관리자) 등록, 수정, 상태 관리
- `template`: 명함 템플릿 및 재질/수량 옵션 관리
- `order`: 명함 입력, 미리보기 동의, 주문 접수, 검수/승인/반려 및 스냅샷 생성
- `shipment`: 배송 관리 및 송장 엑셀 스마트 매칭

### 2.2 테넌트 및 권한 검증 간소화
- 과도한 이중 서블릿 인터셉터 대신, JWT 토큰 내의 `company_id` 및 `role` 정보를 Spring Security Context 및 Service 계층에서 대조하여 데이터 격리를 수행합니다.

---

## 3. Frontend 패키지 아키텍처 (React + TypeScript)

단일 React 애플리케이션에서 로그인한 사용자의 역할과 접속 경로(`/:siteCode`)에 따라 화면 및 라우트를 동적으로 분기합니다.

```text
frontend/src/
├── app/             # Router, Provider (Auth, Tenant), App Layout Guard
├── components/      # UI Layout, Header, Card Preview (SvgBusinessCardPreview 등), Modal
├── pages/           # 도메인/기능 단위 레이아웃 및 페이지
│   ├── auth/        # 로그인 페이지
│   ├── dashboard/   # 메인 대시보드
│   ├── orders/      # 명함 주문 목록, 재주문, 상세 모달
│   ├── members/     # 임직원/회원 관리
│   ├── templates/   # 명함 템플릿 목록, 편집 모달, 시안 교정
│   ├── settings/    # 고객사/부서/계정 설정
│   ├── analytics/   # 발주 통계 분석
│   └── error/       # 404 및 유효하지 않은 테넌트 예외 처리 페이지
├── shared/          # 공통 모듈 및 자산
│   ├── constants/   # API, Navigation, CardTemplates 메타데이터
│   ├── types/       # TypeScript 인터페이스 & DTO 타입
│   ├── utils/       # PDF 생성 엔진 (generateCardPrintPdf) 및 헬퍼 함수
│   └── hooks/       # 커스텀 훅
└── styles/          # Tailwind 및 글로벌 CSS
```

### 3.1 경로 기반 동적 브랜딩 및 테넌트 진입 차단
- 임직원/기업관리자 화면: `/:companyCode/...` (예: `/hanmi/login`, `/cheil/templates`)
- 진입 시 공개 API(`GET /api/v1/public/companies/{companyCode}`)를 통해 DB `companies` 테이블의 `site_code` 존재 여부를 엄격 검증합니다.
- **진입 차단 (`TenantProvider`)**: DB `companies` 테이블의 `site_code`와 일치하지 않는 유효하지 않은 고객사 코드로 접속 시 화면 렌더링을 완전히 차단하고 `CompanyNotFoundPage`로 강제 이동합니다.
- **기본 라우팅 (`App.tsx`)**: URL 뒤에 `/고객사코드`가 없는 루트 접근(`/`, `/login` 등)은 **로그컴 어드민(`logcom`)**으로 자동 인지 및 라우팅됩니다.
- 운영자/시스템관리자 화면: `/operator/...`, `/admin/...` 경로 접속.
