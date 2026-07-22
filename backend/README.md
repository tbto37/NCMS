# NCMS Backend

명함 주문 관리 시스템(NameCard Management System) 백엔드 서버

## 기술 스택

- Java 21
- Spring Boot 3.3.5
- Spring Data JPA
- Spring Security
- Gradle 8.11.1
- H2 Database (개발)
- PostgreSQL (운영)

## 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/logcom/ncms/
│   │   │   ├── NcmsApplication.java          # 메인 애플리케이션
│   │   │   ├── config/                        # 설정
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── common/                        # 공통
│   │   │   │   ├── dto/ApiResponse.java
│   │   │   │   └── exception/GlobalExceptionHandler.java
│   │   │   └── domain/                        # 도메인
│   │   │       ├── auth/                      # 인증·계정
│   │   │       ├── company/                   # 고객사 관리
│   │   │       ├── department/                # 부서 관리
│   │   │       ├── member/                    # 회원·권한 관리
│   │   │       ├── template/                  # 템플릿 관리
│   │   │       ├── product/                   # 상품·가격 관리
│   │   │       ├── order/                     # 주문 관리
│   │   │       ├── approval/                  # 승인·반려
│   │   │       ├── production/                # 인쇄·제작 관리
│   │   │       ├── shipment/                  # 배송·발송 관리
│   │   │       ├── notification/              # 알림
│   │   │       ├── settlement/                # 결제·정산
│   │   │       ├── audit/                     # 감사 로그
│   │   │       └── health/                    # 헬스체크
│   │   │           ├── controller/HealthController.java
│   │   │           └── dto/HealthResponse.java
│   │   └── resources/
│   │       ├── application.yml                # 개발 설정
│   │       └── application-prod.yml           # 운영 설정
│   └── test/
├── build.gradle                               # 빌드 설정
└── settings.gradle                            # 프로젝트 설정
```

## 시작하기

### 사전 요구사항

- JDK 21
- Gradle 8.11+ (또는 Gradle Wrapper 사용)

### Gradle Wrapper 초기화

IntelliJ IDEA에서 프로젝트를 열면 자동으로 Gradle wrapper가 다운로드됩니다.

또는 Gradle이 설치되어 있다면:

```bash
cd backend
gradle wrapper --gradle-version 8.11.1
```

### 빌드 및 실행

```bash
cd backend

# 빌드
./gradlew build

# 실행
./gradlew bootRun
```

Windows에서는 `gradlew.bat`를 사용하세요.

### 서버 확인

서버가 시작되면 다음 URL로 헬스체크를 확인할 수 있습니다:

- API: http://localhost:8080/api/v1/health
- H2 Console: http://localhost:8080/api/h2-console

## API 문서

서버 실행 후 다음 엔드포인트를 사용할 수 있습니다:

### Health Check

```http
GET /api/v1/health
```

응답 예시:

```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-07-22T12:00:00",
    "application": "NCMS Backend",
    "version": "0.0.1-SNAPSHOT"
  }
}
```

## 데이터베이스

### 개발 환경 (H2)

- URL: `jdbc:h2:mem:ncms`
- Username: `sa`
- Password: (없음)
- H2 Console: http://localhost:8080/api/h2-console

### 운영 환경 (PostgreSQL)

환경 변수 설정 필요:

- `DATABASE_URL`: PostgreSQL JDBC URL
- `DATABASE_USERNAME`: 데이터베이스 사용자명
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호

프로파일 활성화:

```bash
./gradlew bootRun --args='--spring.profiles.active=prod'
```

## 테스트

```bash
./gradlew test
```

## 참고 문서

- [기능정의서](../docs/requirements/ncms-functional-spec-v0.1.md)
- [프로젝트 가이드라인](../CLAUDE.md)
