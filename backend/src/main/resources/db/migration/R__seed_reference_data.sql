-- NCMS Seed Reference Data

-- 1. 기본 역할 등록
INSERT INTO roles (id, code, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'ROLE_SYSTEM_ADMIN', '시스템 관리자'),
    ('00000000-0000-0000-0000-000000000002', 'ROLE_COMPANY_ADMIN', '기업 관리자'),
    ('00000000-0000-0000-0000-000000000003', 'ROLE_EMPLOYEE', '일반 임직원'),
    ('00000000-0000-0000-0000-000000000004', 'ROLE_OPERATOR', '로그컴 운영자')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

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
