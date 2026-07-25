# NCMS (NameCard Management System)

**NCMS**는 기업 임직원의 명함 정보 편집·교정·주문부터 로그컴 운영자의 명함 검수(승인/반려), 인쇄, 발송까지 통합 관리하는 멀티테넌트 B2B 명함 관리 시스템입니다.

---

## 기술 스택 (Tech Stack)

| 영역 | 구성 | 배포 |
|---|---|---|
| **Frontend** | React 18+ / TypeScript / Vite / Tailwind CSS | Vercel |
| **Backend** | Java 21 / Spring Boot 3.3+ / Gradle / Spring Data JPA | Railway |
| **Database** | PostgreSQL / Flyway | Railway PostgreSQL |

---

## 저장소 구조

```text
NCMS/
├── backend/        # Spring Boot API 및 Flyway 마이그레이션 SQL
├── frontend/       # 역할 기반 단일 React 애플리케이션
├── docs/           # 기능정의, DB 설계, 아키텍처, API 명세, 온보딩 가이드
├── infra/          # Railway, Vercel, 로컬 개발 환경 설정
└── scripts/        # 개발·배포 보조 스크립트
```

---

## 주요 기준 문서 (Documentation)

- [기능정의서](docs/requirements/functional-spec.md)
- [PostgreSQL 설계서](docs/database/database-design.md)
- [소스 아키텍처 정의서](docs/architecture/source-architecture.md)
- [백엔드 구현 가이드 & API 명세서](docs/api/backend-implementation.md)
- [신규 고객사 온보딩 가이드](docs/onboarding/company-onboarding.md)
- [초기 Flyway DDL](backend/src/main/resources/db/migration/create_initial_schema.sql)
- [역할 기준 데이터 SQL](backend/src/main/resources/db/migration/seed_reference_data.sql)

---

## 개발 및 실행 명령어 (Commands)

- **Backend 빌드 및 테스트**: `cd backend && ./gradlew test`
- **Backend 서버 실행**: `cd backend && ./gradlew bootRun`
- **Frontend 개발 서버 실행**: `cd frontend && npm run dev`
- **Frontend 빌드**: `cd frontend && npm run build`

---

## 배포 루트 (Deployment Configuration)

- **Vercel Root Directory**: `frontend`
- **Railway Backend Root Directory**: `backend`
- **Railway Watch Path**: `/backend/**`

---

## 코드 컨벤션 (Code Conventions)

### Backend (Spring Boot)
1. Controller-Service-Repository 레이어드 아키텍처를 준수합니다.
2. DTO는 Lombok `@Getter`/`@Builder` 또는 Record 타입을 활용합니다.
3. REST API 응답은 공통 `ApiResponse` 객체 및 예외 처리기를 활용합니다.
4. JPA Entity 클래스는 API 레이어에 직접 노출하지 않고 DTO로 매핑합니다.

### Frontend (React)
1. Hooks 기반의 Functional Components를 사용합니다.
2. API 호출은 `src/api/` 또는 커스텀 훅 내부에 작성합니다.
3. UI 컴포넌트의 Loading 및 Error 상태를 명시적으로 처리합니다.
