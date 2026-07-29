-- NCMS Migration V5: 한미글로벌 고객사, 부서, 템플릿, 계정 및 더미 주문 데이터 세팅 (site_code: hanmi)

-- 1. 신규 고객사 등록 (3: 한미글로벌 주식회사, site_code: hanmi)
INSERT INTO companies (id, site_code, name, logo_url, primary_color, status) VALUES
    (3, 'hanmi', '한미글로벌 주식회사', 'https://cdn.logcom.co.kr/logos/hanmiglobal.png', '#004B96', 'ACTIVE')
ON CONFLICT (site_code) DO NOTHING;

-- 2. 부서 등록 (3: 한미글로벌)
INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    (5, 3, '경영지원팀', 1, 'ACTIVE'),
    (6, 3, '비즈니스개발실', 2, 'ACTIVE'),
    (7, 3, '하이테크사업부', 3, 'ACTIVE'),
    (8, 3, '국내사업부', 4, 'ACTIVE'),
    (9, 3, '글로벌사업부', 5, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. 명함 템플릿 신규 등록 (2: 제일엔지니어링, 3: 한미글로벌)
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    (2, '제일엔지니어링 표준 명함', 'https://cdn.logcom.co.kr/templates/cheil_front.png', 'https://cdn.logcom.co.kr/templates/cheil_back.png', 'ACTIVE'),
    (3, '한미글로벌 표준 명함', 'https://cdn.logcom.co.kr/templates/hanmi_front.png', 'https://cdn.logcom.co.kr/templates/hanmi_back.png', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    preview_front_url = EXCLUDED.preview_front_url,
    preview_back_url = EXCLUDED.preview_back_url;

-- 4. 고객사 - 템플릿 매핑 (company_templates)
INSERT INTO company_templates (company_id, template_id) VALUES
    (2, 2),
    (3, 3)
ON CONFLICT DO NOTHING;

-- 5. 한미글로벌 테스트 계정 추가 (비밀번호: 1234 엔코딩값 MTIzNA==)
INSERT INTO members (id, company_id, department_id, username, password, name, email, phone, status) VALUES
    (6, 3, 5, 'hanmi_admin', 'MTIzNA==', '한미관리자', 'admin@hanmiglobal.com', '010-9999-8888', 'ACTIVE'),
    (7, 3, 5, 'hanmi_emp', 'MTIzNA==', '백승연', 'baeksy@hanmiglobal.com', '010-6379-1882', 'ACTIVE'),
    (8, 3, 7, 'hanmi_kim', 'MTIzNA==', '김철수', 'chulsoo.kim@hanmiglobal.com', '010-3341-9921', 'ACTIVE'),
    (9, 3, 8, 'hanmi_lee', 'MTIzNA==', '이영희', 'younghee.lee@hanmiglobal.com', '010-8812-4432', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 6. 계정 권한 부여 (2: ROLE_COMPANY_ADMIN, 3: ROLE_EMPLOYEE)
INSERT INTO member_roles (member_id, role_id) VALUES
    (6, 2),
    (7, 3),
    (8, 3),
    (9, 3)
ON CONFLICT DO NOTHING;

-- 7. 한미글로벌 샘플 더미 주문 데이터 (8, 9, 10)
-- 8번 주문: 검수대기 (PENDING) - 백승연
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    8,
    'ORD-20260729-0008',
    3,
    7,
    3,
    'PENDING',
    '백승연',
    '010-6379-1882',
    '06180',
    '서울시 강남구 테헤란로 518',
    '한국시멘트협회 빌딩 12층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    8,
    8,
    '{"name": "백승연", "department": "경영지원팀", "title": "매니저", "phone": "010-6379-1882", "email": "baeksy@hanmiglobal.com"}'::jsonb,
    '휘라레 216g / 200매',
    'https://cdn.logcom.co.kr/previews/hanmi_801_front.png',
    'https://cdn.logcom.co.kr/previews/hanmi_801_back.png'
) ON CONFLICT (order_id) DO NOTHING;

-- 9번 주문: 검수승인 (APPROVED) - 김철수
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    9,
    'ORD-20260728-0009',
    3,
    8,
    3,
    'APPROVED',
    '김철수',
    '010-3341-9921',
    '06180',
    '서울시 강남구 테헤란로 518',
    '한국시멘트협회 빌딩 14층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '3 hours'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    9,
    9,
    '{"name": "김철수", "department": "하이테크사업부", "title": "수석", "phone": "010-3341-9921", "email": "chulsoo.kim@hanmiglobal.com"}'::jsonb,
    '스노우지 250g / 500매',
    'https://cdn.logcom.co.kr/previews/hanmi_802_front.png',
    'https://cdn.logcom.co.kr/previews/hanmi_802_back.png'
) ON CONFLICT (order_id) DO NOTHING;

-- 10번 주문: 발송완료 (SHIPPED) - 이영희
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    10,
    'ORD-20260727-0010',
    3,
    9,
    3,
    'SHIPPED',
    '이영희',
    '010-8812-4432',
    '06180',
    '서울시 강남구 테헤란로 518',
    '한국시멘트협회 빌딩 15층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    10,
    10,
    '{"name": "이영희", "department": "국내사업부", "title": "책임", "phone": "010-8812-4432", "email": "younghee.lee@hanmiglobal.com"}'::jsonb,
    '띤또레또 250g / 300매',
    'https://cdn.logcom.co.kr/previews/hanmi_803_front.png',
    'https://cdn.logcom.co.kr/previews/hanmi_803_back.png'
) ON CONFLICT (order_id) DO NOTHING;

INSERT INTO shipments (id, order_id, carrier_code, tracking_number, shipped_at)
VALUES (
    2,
    10,
    '우체국택배',
    '609182374910',
    CURRENT_TIMESTAMP - INTERVAL '12 hours'
) ON CONFLICT (order_id) DO NOTHING;
