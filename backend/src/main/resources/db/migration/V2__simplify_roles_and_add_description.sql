-- V2: Simplify roles and member_roles table structures & add description column

-- 1. roles 테이블에 description 컬럼 추가
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(255);

COMMENT ON COLUMN roles.description IS '역할 상세 설명 및 권한 범위';

-- 2. member_roles 테이블 제약조건 및 role_id 타입 변경 (UUID -> VARCHAR(50))
ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS member_roles_role_id_fkey;

ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS role_code VARCHAR(50);

-- 기존 member_roles 데이터 변환 (roles.code 매핑)
UPDATE member_roles mr 
SET role_code = r.code 
FROM roles r 
WHERE mr.role_id = r.id;

-- member_roles 컬럼 정리
ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS member_roles_pkey;
ALTER TABLE member_roles DROP COLUMN role_id;
ALTER TABLE member_roles RENAME COLUMN role_code TO role_id;
ALTER TABLE member_roles ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE member_roles ADD PRIMARY KEY (member_id, role_id);

-- 3. roles 테이블 PK 변경 (id: UUID -> VARCHAR(50) role code)
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE roles DROP COLUMN id;
ALTER TABLE roles RENAME COLUMN code TO id;
ALTER TABLE roles ADD PRIMARY KEY (id);

-- 4. member_roles 외래키 재설정
ALTER TABLE member_roles ADD CONSTRAINT member_roles_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

-- 5. roles 데이터 업데이트 및 초기화
INSERT INTO roles (id, name, description) VALUES
    ('ROLE_SYSTEM_ADMIN', '시스템 관리자', '시스템 관리자: 고객사 등록/수정, 템플릿 관리 등 전체 시스템을 관리하는 최고 관리자'),
    ('ROLE_COMPANY_ADMIN', '기업 관리자', '기업 관리자: 소속 임직원 계정 생성/관리 및 부서 관리, 소속 주문 목록을 조회하는 기업 담당자'),
    ('ROLE_EMPLOYEE', '일반 임직원', '일반 임직원: 명함 템플릿 선택, 입력 문구 작성 및 주문을 접수하는 일반 임직원'),
    ('ROLE_OPERATOR', '로그컴 운영자', '로그컴 운영자: 명함 주문 오탈자 검수, 인쇄/제작 및 배송 송장 정보를 관리하는 로그컴 운영자')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;
