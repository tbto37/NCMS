# NCMS 소스 아키텍처

| 항목 | 내용 |
|---|---|
| 시스템명 | NCMS (NameCard Management System) |
| 저장소명 | `NCMS` |
| 버전 | v0.2 |
| 작성일 | 2026-07-22 |
| 구성 | Spring Boot + React + PostgreSQL 모노레포 |

## 1. 구조 결정

NCMS는 하나의 Git 저장소 안에서 백엔드와 프론트엔드를 분리한다.

- `backend`: Railway에 배포하는 Spring Boot API
- `frontend`: Vercel에 배포하는 React 애플리케이션
- `docs`: 요구사항, DB, 아키텍처, API 계약의 기준 문서
- `infra`: 서비스별 배포 및 로컬 개발 설정

Turborepo, Nx, pnpm workspace 같은 별도 모노레포 도구는 사용하지 않는다. Java와 TypeScript 사이에 직접 공유할 런타임 패키지가 없고, 두 애플리케이션은 각자의 루트에서 독립적으로 빌드·배포한다.

## 2. 전체 폴더 구조

```text
NCMS/
├── .github/
│   └── workflows/
├── backend/
│   └── src/
│       ├── main/
│       │   ├── java/kr/co/tobetheone/ncms/
│       │   │   ├── global/
│       │   │   ├── auth/
│       │   │   ├── company/
│       │   │   ├── department/
│       │   │   ├── member/
│       │   │   ├── template/
│       │   │   ├── product/
│       │   │   ├── order/
│       │   │   ├── approval/
│       │   │   ├── production/
│       │   │   ├── shipment/
│       │   │   ├── notification/
│       │   │   └── audit/
│       │   └── resources/
│       │       ├── db/migration/
│       │       └── templates/email/
│       └── test/java/kr/co/tobetheone/ncms/
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── assets/
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── shared/
│       ├── styles/
│       └── test/
├── docs/
│   ├── architecture/
│   ├── requirements/
│   ├── database/
│   ├── api/
│   └── decisions/
├── infra/
│   ├── railway/
│   ├── vercel/
│   └── local/
└── scripts/
```

## 3. Backend 패키지 원칙

백엔드는 기술 계층을 저장소 전체에 가로로 나누지 않고, 업무 도메인을 먼저 나누는 **도메인 중심 패키지 구조**를 사용한다.

각 도메인은 다음 네 계층을 가진다.

| 패키지 | 책임 |
|---|---|
| `api` | REST Controller, 요청·응답 DTO, API 검증 |
| `application` | Use Case, 트랜잭션, 도메인 간 흐름 조정 |
| `domain` | Entity, Value Object, 정책, Repository 인터페이스 |
| `infrastructure` | JPA Repository 구현, 외부 API·파일·메일 어댑터 |

의존 방향은 아래 규칙을 따른다.

```text
api -> application -> domain
infrastructure -> application/domain
domain -> 외부 기술 의존 없음
```

### 3.1 Backend 도메인 책임

| 도메인 | 책임 |
|---|---|
| `auth` | 로그인, 토큰, 비밀번호 초기화, 계정 잠금 |
| `company` | 고객사와 고객사별 운영 정책 |
| `department` | 고객사별 부서 계층 |
| `member` | 회원, 역할, 고객사 접근 범위 |
| `template` | 명함 템플릿, 버전, 편집 필드 |
| `product` | 재질, 수량, 고객사별 상품·가격 정책 |
| `order` | 주문, 명함 스냅샷, 교정 확인, 재주문 |
| `approval` | 로그컴 운영자의 명함 검수(승인·반려)와 검수 이력 |
| `production` | 인쇄 작업과 인쇄용 PDF 버전 |
| `shipment` | 배송, 택배사, 송장, 배송 이력 |
| `notification` | 이메일 템플릿, 발송 큐, 재시도 |
| `audit` | 중요 변경의 감사 로그 |

### 3.2 `global` 사용 범위

`global`에는 여러 도메인이 공통으로 사용하는 기술 요소만 둔다.

- `config`: Spring 및 애플리케이션 설정
- `security`: Spring Security 공통 구성과 인증 컨텍스트
- `tenant`: 고객사 코드→`company_id` 해석, `company_id` 접근 범위와 멀티테넌트 검증
- `exception`: 공통 예외와 예외 처리기
- `response`: 공통 API 응답 형식
- `storage`: 파일 저장소 공통 인터페이스와 구현

업무 규칙이나 특정 도메인의 편의 코드는 `global`에 두지 않는다.

### 3.3 핵심 구현 규칙

- Controller에서 JPA Entity를 직접 요청·응답으로 노출하지 않는다.
- 다른 도메인의 Repository 구현체를 직접 호출하지 않고 Application 계층을 통해 협력한다.
- 승인 상태와 제작 상태는 분리한다.
- 주문 제출 시 명함·템플릿·상품·가격을 스냅샷으로 고정한다.
- 상태 현재값과 상태 이력은 같은 트랜잭션에서 변경한다.
- 운영 DB에 적용된 Flyway 파일은 수정하지 않고 `V2`, `V3`로 추가한다.
- 고객사 소유 데이터 조회 시 서버에서 `company_id` 범위를 강제한다.

## 4. Frontend 구조 원칙

프론트엔드는 일반 임직원, 기업 관리자, 로그컴 운영자, 시스템 관리자를 위한 **단일 React 애플리케이션**으로 구성한다. 로그인 사용자의 역할에 따라 라우트와 메뉴를 분기하되, 실제 권한 검증은 백엔드에서 다시 수행한다.

| 폴더 | 책임 |
|---|---|
| `app` | Router, Provider, 인증·권한 Guard, 앱 초기화 |
| `assets` | 이미지, 폰트 등 정적 소스 |
| `components` | 업무 도메인에 속하지 않는 공통 UI와 Layout |
| `features` | 도메인별 API, 상태, 훅, 컴포넌트, 타입 |
| `pages` | 역할별 화면 조합과 라우트 진입점 |
| `shared` | API Client, 환경설정, 공통 타입·유틸·검증 |
| `styles` | 전역 스타일과 디자인 토큰 |
| `test` | 테스트 설정과 Mock |

프론트 의존 방향은 아래처럼 제한한다.

```text
app/pages -> features -> shared
app/pages -> components -> shared
shared -> 다른 상위 폴더 의존 금지
```

### 4.1 역할별 페이지 영역

| 폴더 | 대상 |
|---|---|
| `pages/employee` | 일반 임직원의 편집·교정·주문·재주문 |
| `pages/company-admin` | 고객사 회원·부서·승인 관리 |
| `pages/operator` | 로그컴 인쇄·발송 운영 |
| `pages/system-admin` | 고객사·템플릿·상품·운영계정 관리 |

페이지는 비즈니스 로직을 직접 소유하지 않고 `features`를 조합한다. 특정 기능에서만 쓰는 컴포넌트와 타입은 해당 feature 안에 두며, 재사용이 확인되기 전에는 `shared`로 올리지 않는다.

### 4.2 경로 기반 고객사 라우팅

고객사 대상 화면은 로그컴 도메인 하위 경로 `/{companyCode}`로 접속한다. 예: `/samsung/login`, `/samsung/templates`. 레거시 시스템의 URL 제공 방식을 그대로 승계하며, Vercel 단일 배포본 하나가 경로의 고객사 코드로 대상 고객사를 식별한다.

- `app` 라우터는 최상위에 `/:companyCode` 세그먼트를 두고 그 하위에 임직원·기업 관리자 라우트를 배치한다.
- 진입 시 고객사 코드로 브랜딩(로고·대표색)과 로그인 화면을 구성하되, 데이터 접근 권한은 로그인 사용자의 `company_id`와 역할로 백엔드가 다시 판정한다.
- 로그컴 운영자·시스템 관리자 화면은 `/operator`, `/admin` 등 고객사 코드 없는 경로에 둔다.
- 백엔드는 경로 또는 헤더로 전달된 고객사 코드를 `company_id`로 해석하되 이를 신뢰 경계로 삼지 않고 인증 주체의 소속과 반드시 대조한다.

## 5. 테스트 구조

- Backend `arch`: 패키지 의존 규칙 검증
- Backend `integration`: DB, 보안, API 통합 테스트
- Backend `support`: Fixture, Test Container, 공통 테스트 도구
- Frontend `src/test`: 테스트 런타임 설정과 Mock

단위 테스트는 대상 소스와 가까운 패키지 또는 feature에 배치하고, 종단 간 테스트 도구가 확정되면 `frontend/e2e`를 별도로 추가한다.

## 6. 문서 관리

- `docs/requirements`: 기능정의와 정책
- `docs/database`: ERD, 테이블, 마이그레이션 설명
- `docs/architecture`: 소스 및 시스템 구조
- `docs/api`: OpenAPI와 API 사용 예시
- `docs/decisions`: 중요한 기술 결정을 기록하는 ADR

API 계약이 확정되면 Backend OpenAPI 명세를 기준으로 Frontend API 타입을 생성한다. DB 스키마는 Flyway SQL을 최종 기준으로 삼는다.

## 7. 배포 경계

| 서비스 | 저장소 루트 | 변경 감지 |
|---|---|---|
| Vercel | `frontend` | `frontend/**` |
| Railway Backend | `backend` | `/backend/**` |
| Railway PostgreSQL | 별도 Railway 서비스 | Backend 환경변수로 연결 |

Railway PostgreSQL은 Spring Boot 컨테이너에 DB 파일을 마운트하는 방식이 아니라, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` 참조 변수로 연결한다.

