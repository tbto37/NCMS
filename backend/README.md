# NCMS Backend

명함 주문 관리 시스템(NameCard Management System) 백엔드 서버

## 기술 스택

- Java 21
- Spring Boot 3.3.5
- Spring Data JPA + Hibernate
- Spring Security
- Flyway (Database Migration)
- Gradle 8.11.1
- H2 Database (개발)
- PostgreSQL 15+ (운영)

## 아키텍처

### 패키지 구조 (도메인 중심)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/kr/co/tobetheone/ncms/
│   │   │   ├── NcmsApplication.java          # 메인 애플리케이션
│   │   │   ├── global/                        # 공통 기술 요소
│   │   │   │   ├── config/                    # Spring 설정
│   │   │   │   │   ├── JpaConfig.java
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── domain/                    # 공통 도메인
│   │   │   │   │   └── BaseEntity.java
│   │   │   │   ├── exception/                 # 예외 처리
│   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   ├── response/                  # API 응답
│   │   │   │   │   └── ApiResponse.java
│   │   │   │   ├── security/                  # 인증/보안
│   │   │   │   ├── tenant/                    # 멀티테넌트
│   │   │   │   │   └── TenantContext.java
│   │   │   │   └── storage/                   # 파일 저장소
│   │   │   ├── auth/                          # 인증·계정
│   │   │   │   ├── api/                       # REST Controller
│   │   │   │   ├── application/               # Use Case
│   │   │   │   ├── domain/                    # Entity, Repository
│   │   │   │   └── infrastructure/            # JPA 구현
│   │   │   ├── company/                       # 고객사 관리
│   │   │   │   ├── api/
│   │   │   │   ├── application/
│   │   │   │   ├── domain/
│   │   │   │   │   └── Company.java
│   │   │   │   └── infrastructure/
│   │   │   ├── department/                    # 부서 관리
│   │   │   │   └── domain/
│   │   │   │       └── Department.java
│   │   │   ├── member/                        # 회원·권한 관리
│   │   │   │   └── domain/
│   │   │   │       ├── Member.java
│   │   │   │       └── Role.java
│   │   │   ├── template/                      # 템플릿 관리
│   │   │   ├── product/                       # 상품·가격 관리
│   │   │   ├── order/                         # 주문 관리
│   │   │   │   └── domain/
│   │   │   │       └── Order.java
│   │   │   ├── approval/                      # 승인·반려
│   │   │   ├── production/                    # 인쇄·제작 관리
│   │   │   ├── shipment/                      # 배송·발송 관리
│   │   │   ├── notification/                  # 알림
│   │   │   ├── audit/                         # 감사 로그
│   │   │   └── health/                        # 헬스체크
│   │   │       ├── api/
│   │   │       │   ├── HealthController.java
│   │   │       │   └── dto/HealthResponse.java
│   │   │       ├── application/
│   │   │       └── domain/
│   │   └── resources/
│   │       ├── application.yml                # 개발 설정 (H2)
│   │       ├── application-prod.yml           # 운영 설정 (PostgreSQL)
│   │       └── db/migration/                  # Flyway 마이그레이션
│   │           ├── V1__create_initial_schema.sql
│   │           └── R__seed_reference_data.sql
│   └── test/
├── build.gradle                               # 빌드 설정
└── settings.gradle                            # 프로젝트 설정
```

### 계층별 책임

| 계층 | 책임 |
|---|---|
| **api** | REST Controller, 요청·응답 DTO, API 검증 |
| **application** | Use Case, 트랜잭션, 도메인 간 흐름 조정 |
| **domain** | Entity, Value Object, 정책, Repository 인터페이스 |
| **infrastructure** | JPA Repository 구현, 외부 API·파일·메일 어댑터 |

### 의존 방향

```
api -> application -> domain
infrastructure -> application/domain
domain -> 외부 기술 의존 없음
```

## 주요 도메인

| 도메인 | 책임 |
|---|---|
| `auth` | 로그인, 토큰, 비밀번호 초기화, 계정 잠금 |
| `company` | 고객사와 고객사별 운영 정책 |
| `department` | 고객사별 부서 계층 |
| `member` | 회원, 역할, 고객사 접근 범위 |
| `template` | 명함 템플릿, 버전, 편집 필드 |
| `product` | 재질, 수량, 고객사별 상품·가격 정책 |
| `order` | 주문, 명함 스냅샷, 교정 확인, 재주문 |
| `approval` | 승인·반려·재상신과 승인 이력 |
| `production` | 인쇄 작업과 인쇄용 PDF 버전 |
| `shipment` | 배송, 택배사, 송장, 배송 이력 |
| `notification` | 이메일 템플릿, 발송 큐, 재시도 |
| `audit` | 중요 변경의 감사 로그 |

## 시작하기

### 사전 요구사항

- JDK 21
- IntelliJ IDEA (권장)

### IntelliJ IDEA에서 프로젝트 열기

1. `File` → `Open` → `NCMS/backend` 선택
2. Gradle 프로젝트로 자동 인식되어 의존성 다운로드 시작
3. Gradle wrapper가 자동으로 다운로드됨

### 빌드 및 실행

#### 개발 환경 (H2)

```bash
cd backend

# 빌드
./gradlew build

# 실행 (H2 in-memory database)
./gradlew bootRun
```

Windows에서는 `gradlew.bat`를 사용하세요.

#### 운영 환경 (PostgreSQL)

```bash
# Railway 환경변수가 설정된 상태에서
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### 서버 확인

서버가 시작되면 다음 URL로 접근할 수 있습니다:

- **Health Check**: http://localhost:8080/api/v1/health
- **H2 Console**: http://localhost:8080/api/h2-console (개발 환경만)

## API 문서

### Health Check

```http
GET /api/v1/health
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-07-22T03:00:00Z",
    "application": "NCMS Backend",
    "version": "0.0.1-SNAPSHOT"
  }
}
```

## 데이터베이스

### 개발 환경 (H2)

- **URL**: `jdbc:h2:mem:ncms`
- **Username**: `sa`
- **Password**: (없음)
- **H2 Console**: http://localhost:8080/api/h2-console
- **Flyway**: 활성화 (스키마 자동 생성)

서버 시작 시 Flyway가 자동으로 다음을 실행:
1. `V1__create_initial_schema.sql` - 초기 스키마 생성
2. `R__seed_reference_data.sql` - 역할 기준 데이터 삽입

### 운영 환경 (PostgreSQL on Railway)

**필수 환경 변수:**

```bash
PGHOST=<railway-postgres-host>
PGPORT=5432
PGDATABASE=railway
PGUSER=<db-user>
PGPASSWORD=<db-password>
```

Railway 배포 시 자동으로 설정됩니다:

```bash
# Railway Backend Service Variables 설정
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```

**Flyway 마이그레이션:**

- `ddl-auto`: `validate` (Hibernate가 스키마를 생성하지 않음)
- Flyway가 마이그레이션 자동 실행
- 운영 DB에 적용된 V1은 수정 금지 → V2, V3로 추가

## 멀티테넌트 (Multi-tenant)

고객사별 데이터 격리를 위해 `company_id` 기반 멀티테넌트 구조 적용:

- 모든 기업 업무 데이터는 `company_id` 포함
- `TenantContext`로 현재 요청의 고객사 컨텍스트 관리
- Repository 쿼리에서 `company_id` 필터링 강제
- 기업 사용자와 기업 관리자는 본인 고객사 데이터만 접근 가능

## 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests "kr.co.tobetheone.ncms.order.*"
```

## 주요 구현 규칙

1. **Entity 직접 노출 금지**: Controller에서 JPA Entity를 직접 요청·응답으로 사용하지 않고 DTO 사용
2. **Repository 직접 호출 금지**: 다른 도메인의 Repository를 직접 호출하지 않고 Application 계층 통해 협력
3. **상태 분리**: 승인 상태(`approval_status`)와 제작 상태(`production_status`) 분리 관리
4. **주문 스냅샷**: 주문 제출 시 명함·템플릿·상품·가격을 스냅샷으로 고정
5. **물리 삭제 금지**: `status`와 `deleted_at`으로 논리 삭제
6. **Flyway 수정 금지**: 운영에 적용된 마이그레이션 파일은 수정하지 않고 V2, V3로 추가

## 참고 문서

- [기능정의서](../docs/requirements/ncms-functional-spec-v0.1.md)
- [소스 아키텍처](../docs/architecture/ncms-source-architecture-v0.1.md)
- [데이터베이스 설계](../docs/database/ncms-database-design-v0.1.md)
- [프로젝트 가이드라인](../CLAUDE.md)
