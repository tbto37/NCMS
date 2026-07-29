-- V2: Simplify roles and member_roles table structures & add description column

-- 1. roles 테이블에 description 컬럼 추가 및 code 컬럼 보장
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(255);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS code VARCHAR(50);

COMMENT ON COLUMN roles.description IS '역할 상세 설명 및 권한 범위';
COMMENT ON COLUMN roles.code IS '역할 고유 코드';

-- 2. roles 데이터 업데이트 및 초기화 (1: ROLE_SYSTEM_ADMIN, 2: ROLE_COMPANY_ADMIN, 3: ROLE_EMPLOYEE, 4: ROLE_OPERATOR)
INSERT INTO roles (id, code, name, description) VALUES
    (1, 'ROLE_SYSTEM_ADMIN', '시스템 관리자', '시스템 관리자: 고객사 등록/수정, 템플릿 관리 등 전체 시스템을 관리하는 최고 관리자'),
    (2, 'ROLE_COMPANY_ADMIN', '기업 관리자', '기업 관리자: 소속 임직원 계정 생성/관리 및 부서 관리, 소속 주문 목록을 조회하는 기업 담당자'),
    (3, 'ROLE_EMPLOYEE', '일반 임직원', '일반 임직원: 명함 템플릿 선택, 입력 문구 작성 및 주문을 접수하는 일반 임직원'),
    (4, 'ROLE_OPERATOR', '로그컴 운영자', '로그컴 운영자: 명함 주문 오탈자 검수, 인쇄/제작 및 배송 송장 정보를 관리하는 로그컴 운영자')
ON CONFLICT (id) DO UPDATE SET 
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description;
