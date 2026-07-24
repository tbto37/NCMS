# NCMS 백엔드 1차 범위 구현 및 API 명세서 (Backend Implementation Guide)

| 항목 | 내용 |
|---|---|
| 문서명 | NCMS Spring Boot 백엔드 1차 범위 구현 및 API 명세서 |
| 버전 | v0.1 |
| 작성일 | 2026-07-24 |
| 개발 스택 | Spring Boot 3.3.5 / Spring Security / Spring Data JPA / PostgreSQL |

---

## 1. 개요 및 구현 범위

본 문서는 `ncms-functional-spec-v0.1.md` 기능정의서에 근거하여 NCMS 백엔드에 구축된 1차 최우선 개발 범위 전체의 도메인 아키텍처 및 REST API 명세를 정리한 가이드입니다.

---

## 2. 주요 구현 도메인 및 API 목록

### 2.1 인증 및 보안 (Auth & Security)

JWT 기반의 인증 체계를 사용하며, 요청 헤더 `Authorization: Bearer <Access_Token>`으로 검증합니다.

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Anyone | 아이디/비밀번호 인증 후 JWT Access/Refresh 토큰 발급 |
| `POST` | `/api/v1/auth/password/change` | Authenticated | 본인 비밀번호 변경 |
| `POST` | `/api/v1/auth/logout` | Authenticated | 로그아웃 처리 |

---

### 2.2 고객사 및 부서 관리 (Company & Department)

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/public/companies/{siteCode}` | Anyone | 공개 브랜딩 API (로고, 대표색상, 회사명) |
| `GET` | `/api/v1/admin/companies/{id}` | `SYSTEM_ADMIN` | 고객사 상세 조회 |
| `POST` | `/api/v1/admin/companies` | `SYSTEM_ADMIN` | 신규 고객사 등록 |
| `GET` | `/api/v1/company/departments` | `COMPANY_ADMIN`, `EMPLOYEE` | 소속 고객사 부서 목록 및 계층 조회 |
| `POST` | `/api/v1/company/departments` | `COMPANY_ADMIN` | 소속 고객사 부서 신규 등록 |

---

### 2.3 회원 및 권한 관리 (Member & Role)

핵심 정책: **임직원 계정 등록은 기업 관리자(`COMPANY_ADMIN`)만 가능**하며, 로그컴 시스템 관리자(`SYSTEM_ADMIN`)는 등록 불가(수정 및 사용중지만 가능)합니다.

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/company/members` | `COMPANY_ADMIN` | **소속 고객사 임직원 회원 등록 (`MEM-002`)** |
| `GET` | `/api/v1/company/members` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | 소속 고객사 회원 목록 조회 |
| `PUT` | `/api/v1/company/members/{id}` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | 회원 정보 수정 |
| `PATCH` | `/api/v1/company/members/{id}/status` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | 회원 사용중지/활성화 (`MEM-004`) |
| `POST` | `/api/v1/admin/members` | `SYSTEM_ADMIN` | **[차단] 403 Forbidden 반환** (검수 기준 `14.1` 반영) |

---

### 2.4 템플릿 및 상품 (Template & Product)

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/company/templates` | `EMPLOYEE`, `COMPANY_ADMIN` | 소속 고객사에 배정된 활성 명함 템플릿 목록 조회 |
| `GET` | `/api/v1/company/templates/{id}` | `EMPLOYEE`, `COMPANY_ADMIN` | 템플릿 상세 조회 |

---

### 2.5 주문 및 스냅샷 (Order & Snapshot)

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `POST` | `/api/v1/orders` | `EMPLOYEE`, `COMPANY_ADMIN` | 명함 신청 및 주문 스냅샷 생성 (`PENDING` / `RECEIVED`) |
| `GET` | `/api/v1/orders` | `EMPLOYEE`, `COMPANY_ADMIN` | 본인 또는 소속 고객사 주문 내역 조회 |
| `GET` | `/api/v1/orders/{id}` | Authenticated | 주문 상세 및 당시 명함 스냅샷 조회 |

---

### 2.6 로그컴 운영자 검수 및 제작/배송 (Operator Approval & Production)

| Method | Endpoint | 역할 제한 | 설명 |
|---|---|---|---|
| `GET` | `/api/v1/operator/orders` | `OPERATOR`, `SYSTEM_ADMIN` | 로그컴 운영자 전용 검수 대기 주문 목록 조회 |
| `POST` | `/api/v1/operator/orders/{id}/approve` | `OPERATOR`, `SYSTEM_ADMIN` | 로그컴 운영자 명함 오타/오류 검수 승인 (`APPROVED`) |
| `POST` | `/api/v1/operator/orders/{id}/reject` | `OPERATOR`, `SYSTEM_ADMIN` | 로그컴 운영자 명함 검수 반려 (반려 사유 필수 기록) |
| `PATCH` | `/api/v1/operator/orders/{id}/production-status` | `OPERATOR`, `SYSTEM_ADMIN` | 제작 상태 변경 (`PRINTING`, `SHIPPED`, `DELIVERED`) |

---

## 3. 핵심 아키텍처 검증 사항

1. **`company_id` 기반 데이터 격리**:
   - `TenantContext` 및 `TenantResolverInterceptor`를 통해 서버 단에서 요청자의 `company_id`와 데이터 소속을 이중 검증합니다.
2. **원인 기반 권한 차단**:
   - `SYSTEM_ADMIN`이 회원 등록 API를 직접 호출할 경우 `403 Forbidden` 예외가 발생하도록 `MemberService.registerMemberBySystemAdmin()` 구현을 완료했습니다.
