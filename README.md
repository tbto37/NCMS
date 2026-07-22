# NCMS

**NCMS (NameCard Management System)**는 기업 임직원의 명함 편집·교정·주문부터 기업 승인, 인쇄, 발송까지 관리하는 멀티테넌트 시스템이다.

## 기술 구성

| 영역 | 구성 | 배포 |
|---|---|---|
| Frontend | React + TypeScript + Vite | Vercel |
| Backend | Spring Boot + Gradle | Railway |
| Database | PostgreSQL + Flyway | Railway PostgreSQL |

## 저장소 구조

```text
NCMS/
├── backend/        Spring Boot API와 Flyway 마이그레이션
├── frontend/       역할 기반 단일 React 애플리케이션
├── docs/           기능정의, DB 설계, 아키텍처, API 문서
├── infra/          Railway, Vercel, 로컬 환경 설정
├── scripts/        개발·배포 보조 스크립트
└── .github/        CI/CD 워크플로
```

상세 패키지 원칙은 [`docs/architecture/ncms-source-architecture-v0.1.md`](docs/architecture/ncms-source-architecture-v0.1.md)를 따른다.

## 기준 문서

- [기능정의서](docs/requirements/ncms-functional-spec-v0.1.md)
- [PostgreSQL 설계서](docs/database/ncms-database-design-v0.1.md)
- [초기 Flyway DDL](backend/src/main/resources/db/migration/V1__create_initial_schema.sql)
- [역할 기준데이터](backend/src/main/resources/db/migration/R__seed_reference_data.sql)

## 배포 루트

- Vercel Root Directory: `frontend`
- Railway Backend Root Directory: `backend`
- Railway Watch Path: `/backend/**`

현재 저장소는 소스 아키텍처와 폴더 구조가 확정된 단계다. Spring Boot와 React의 실행 파일 및 빌드 설정은 다음 개발 단계에서 추가한다.

