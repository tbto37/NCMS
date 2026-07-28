-- NCMS Seed Reference Data

-- 1. 기본 역할 등록
INSERT INTO roles (id, name, description) VALUES
    ('ROLE_SYSTEM_ADMIN', '시스템 관리자', '시스템 관리자: 고객사 등록/수정, 템플릿 관리 등 전체 시스템을 관리하는 최고 관리자'),
    ('ROLE_COMPANY_ADMIN', '기업 관리자', '기업 관리자: 소속 임직원 계정 생성/관리 및 부서 관리, 소속 주문 목록을 조회하는 기업 담당자'),
    ('ROLE_EMPLOYEE', '일반 임직원', '일반 임직원: 명함 템플릿 선택, 입력 문구 작성 및 주문을 접수하는 일반 임직원'),
    ('ROLE_OPERATOR', '로그컴 운영자', '로그컴 운영자: 명함 주문 오탈자 검수, 인쇄/제작 및 배송 송장 정보를 관리하는 로그컴 운영자')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. 샘플 고객사 등록 (카카오)
INSERT INTO companies (id, site_code, name, logo_url, primary_color, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'kakao', '(주)카카오', 'https://cdn.logcom.co.kr/logos/kakao.png', '#FEE500', 'ACTIVE')
ON CONFLICT (site_code) DO NOTHING;

-- 3. 기본 명함 상품 옵션
INSERT INTO product_options (id, material_name, quantity, status) VALUES
    ('22222222-2222-2222-2222-222222222221', '스노우지 250g', 200, 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222222', '띤또레또 250g', 200, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. 기본 템플릿 등록
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    ('33333333-3333-3333-3333-333333333333', '기본 스탠다드 템플릿', 'https://cdn.logcom.co.kr/templates/std_front.png', 'https://cdn.logcom.co.kr/templates/std_back.png', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. 고객사-템플릿 매핑
INSERT INTO company_templates (company_id, template_id) VALUES
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;
