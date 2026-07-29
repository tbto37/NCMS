-- NCMS Seed Reference Data

-- 1. 기본 역할 등록
INSERT INTO roles (id, code, name, description) VALUES
    (1, 'ROLE_SYSTEM_ADMIN', '시스템 관리자', '시스템 관리자: 고객사 등록/수정, 템플릿 관리 등 전체 시스템을 관리하는 최고 관리자'),
    (2, 'ROLE_COMPANY_ADMIN', '기업 관리자', '기업 관리자: 소속 임직원 계정 생성/관리 및 부서 관리, 소속 주문 목록을 조회하는 기업 담당자'),
    (3, 'ROLE_EMPLOYEE', '일반 임직원', '일반 임직원: 명함 템플릿 선택, 입력 문구 작성 및 주문을 접수하는 일반 임직원'),
    (4, 'ROLE_OPERATOR', '로그컴 운영자', '로그컴 운영자: 명함 주문 오탈자 검수, 인쇄/제작 및 배송 송장 정보를 관리하는 로그컴 운영자')
ON CONFLICT (id) DO UPDATE SET 
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. 샘플 고객사 등록 (로그컴: 1, 제일엔지니어링: 2)
INSERT INTO companies (id, site_code, name, logo_url, primary_color, status) VALUES
    (1, 'logcom', '로그컴', 'https://cdn.logcom.co.kr/logos/logcom.png', '#0052CC', 'ACTIVE'),
    (2, 'cheil', '제일엔지니어링', 'https://cdn.logcom.co.kr/logos/cheil.png', '#06418F', 'ACTIVE')
ON CONFLICT (site_code) DO NOTHING;

-- 2.1 기본 부서 등록 (1 ~ 4)
INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    (1, 1, '플랫폼기획팀', 1, 'ACTIVE'),
    (2, 1, '브랜드디자인팀', 2, 'ACTIVE'),
    (3, 2, '도로사업부', 1, 'ACTIVE'),
    (4, 2, '경영지원팀', 2, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. 기본 명함 상품 옵션 (용지 사양 & 수량)
INSERT INTO product_options (id, category, name, sort_order, status) VALUES
    (1, 'PAPER', '휘라레 216g', 1, 'ACTIVE'),
    (2, 'PAPER', '스노우지 250g', 2, 'ACTIVE'),
    (3, 'PAPER', '랑데뷰 240g', 3, 'ACTIVE'),
    (4, 'PAPER', '띤또레또 250g', 4, 'ACTIVE'),
    (5, 'QTY', '100매', 1, 'ACTIVE'),
    (6, 'QTY', '200매', 2, 'ACTIVE'),
    (7, 'QTY', '300매', 3, 'ACTIVE'),
    (8, 'QTY', '500매', 4, 'ACTIVE'),
    (9, 'QTY', '1000매', 5, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. 기본 템플릿 등록 (1)
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    (1, '기본 스탠다드 템플릿', 'https://cdn.logcom.co.kr/templates/std_front.png', 'https://cdn.logcom.co.kr/templates/std_back.png', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. 고객사-템플릿 매핑
INSERT INTO company_templates (company_id, template_id) VALUES
    (1, 1),
    (2, 1)
ON CONFLICT DO NOTHING;
