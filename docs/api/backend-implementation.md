# NCMS 백엔드 구현 가이드 및 API 명세서 (MVP 간소화 버전)

| 항목 | 내용 |
|---|---|
| 문서명 | NCMS Spring Boot 백엔드 구현 가이드 및 API 명세서 |
| 프로덕션 도메인 | `https://ncms-production.up.railway.app` |
| 버전 | v0.3 (MVP 간소화) |
| 작성일 | 2026-07-29 |
| 개발 스택 | Spring Boot 3.3+ / Spring Security / Spring Data JPA / PostgreSQL |
| 날짜/시간 타입 | `java.time.LocalDateTime` 일관 적용 (KST 기준 직관적 시각 연산) |

---

## 1. 개요 및 인증 방식

- **프로덕션 API 서버**: `https://ncms-production.up.railway.app`
- **인증 방식**: JWT 기반 (HTTP Request Header: `Authorization: Bearer <Access_Token>`)
- **공통 응답**: 표준 JSON 응답 및 에러 코드 전달
- **CORS 허용**: `CORS_ALLOWED_ORIGINS` 환경변수 지원 (`https://ncms-production.up.railway.app` 등)

---

## 2. 주요 API 목록

### 2.1 인증 (Auth)

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Anyone | 아이디/비밀번호 로그인 및 JWT/토큰 응답 발급 (`companySiteCode` 포함) |
| `POST` | `/api/v1/auth/password/change` | Authenticated | 본인 비밀번호 변경 |

---

### 2.1.1 멀티테넌트 세션 및 로그인 격리 규칙 (Security)
- **백엔드 차원의 `siteCode` DB 검증 (`AuthService`)**:
  - `POST /api/v1/auth/login` 요청 시 전달된 `siteCode`가 DB `companies` 테이블에 존재하는지 1차 DB 조회 수행 (`findBySiteCode`).
  - DB에 `siteCode`가 존재하지 않을 경우 백엔드에서 `404 NOT_FOUND ("존재하지 않는 고객사 사이트입니다.")` 예외를 발생시켜 차단.
  - 비활성화(`INACTIVE`) 고객사이거나, 운영자가 아닌 일반 사용자가 소속 회사가 아닌 타 테넌트 `siteCode`로 진입 시 `403 FORBIDDEN` 예외 차단.
- **로그인 시점 권한 검증 (`LoginPage`)**:
  - `/hanmi/login`, `/cheil/login` 등 테넌트 전용 페이지에서 타 사이트 계정이나 로그컴 운영자 계정 로그인 시 **"접근 권한 없음"으로 차단**.
- **세션 자동 만료 라우트 가드 (`RequireTenantAuth`, `RequireAdminAuth`)**:
  - 새로고침이나 URL 직접 입력으로 타 테넌트 세션으로 접근 시 **즉시 세션 만료 (로그아웃) 후 해당 사이트 로그인으로 리다이렉트**.

---

### 2.2 고객사 & 부서 (Company & Department)

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/public/companies/{siteCode}` | Anyone | 공개 브랜딩 API (로고, 대표색상, 회사명) |
| `GET` | `/api/v1/admin/companies/{id}` | `SYSTEM_ADMIN` | 고객사 상세 조회 |
| `POST` | `/api/v1/admin/companies` | `SYSTEM_ADMIN` | 신규 고객사 등록 |
| `GET` | `/api/v1/company/departments` | Authenticated | 소속 고객사 부서 목록 조회 |
| `POST` | `/api/v1/company/departments` | `COMPANY_ADMIN` | 부서 등록 |

---

### 2.3 회원 관리 (Member)

※ **기업 임직원 신규 계정 등록은 기업 관리자(`COMPANY_ADMIN`)만 가능**하며, 시스템 관리자(`SYSTEM_ADMIN`)는 신규 회원 등록 API 호출 시 403 Forbidden 차단 (조회/수정/중지만 가능).

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/company/members` | `COMPANY_ADMIN` | **소속 임직원 회원 등록 (`MEM-001`)** |
| `GET` | `/api/v1/company/members` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | 소속 고객사 회원 목록 조회 |
| `PUT` | `/api/v1/company/members/{id}` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | 회원 정보 수정 및 비활성화 |

---

### 2.4 템플릿 & 상품 (Template & Product)

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/company/templates` | `EMPLOYEE`, `COMPANY_ADMIN` | 소속 고객사 배정 명함 템플릿 목록 조회 |
| `POST` | `/api/v1/admin/templates` | `SYSTEM_ADMIN` | 명함 템플릿 신규 등록 |

---

### 2.5 명함 주문 & 스냅샷 (Order)

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/orders` | `EMPLOYEE`, `COMPANY_ADMIN` | 명함 주문 제출 및 명함 문구 스냅샷 생성 (`PENDING`) |
| `GET` | `/api/v1/orders` | `EMPLOYEE`, `COMPANY_ADMIN` | 본인 또는 소속 고객사 주문 목록 조회 |
| `GET` | `/api/v1/orders/{id}` | Authenticated | 주문 상세 및 명함 스냅샷 정보 조회 |

---

### 2.6 로그컴 운영자 검수 & 인쇄/배송 (Operator)

| Method | Endpoint | 권한 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/operator/orders` | `OPERATOR`, `SYSTEM_ADMIN` | 로그컴 운영자 전용 검수/제작 대기 주문 목록 조회 |
| `POST` | `/api/v1/operator/orders/{id}/approve` | `OPERATOR`, `SYSTEM_ADMIN` | 오타/오류 검수 승인 (`APPROVED`) |
| `POST` | `/api/v1/operator/orders/{id}/reject` | `OPERATOR`, `SYSTEM_ADMIN` | 명함 검수 반려 및 반려 사유 기록 (`REJECTED`) |
| `PATCH` | `/api/v1/operator/orders/{id}/status` | `OPERATOR`, `SYSTEM_ADMIN` | 제작/배송 상태 변경 (`PRINTING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PENDING`) 및 송장 등록 |
| `DELETE` | `/api/v1/operator/orders/{id}` | `OPERATOR`, `SYSTEM_ADMIN` | 주문 내역 영구 삭제 (스냅샷 및 배송 정보 연쇄 삭제) |
