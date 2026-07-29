-- ========================================================
-- NCMS 샘플 주문 더미 데이터 생성 스크립트 (5건 - BIGINT ID 사용)
-- ========================================================

-- 1. 샘플 회사 및 회원이 없을 경우 대비한 데이터 보장
INSERT INTO companies (id, site_code, name, logo_url, primary_color, status) VALUES
    (1, 'logcom', '로그컴', 'https://cdn.logcom.co.kr/logos/logcom.png', '#0052CC', 'ACTIVE'),
    (2, 'cheil', '제일엔지니어링', 'https://cdn.logcom.co.kr/logos/cheil.png', '#06418F', 'ACTIVE')
ON CONFLICT (site_code) DO NOTHING;

INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    (1, 1, '플랫폼기획팀', 1, 'ACTIVE'),
    (2, 1, '브랜드디자인팀', 2, 'ACTIVE'),
    (3, 2, '도로사업부', 1, 'ACTIVE'),
    (4, 2, '경영지원팀', 2, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    (1, '기본 스탠다드 템플릿', 'https://cdn.logcom.co.kr/templates/std_front.png', 'https://cdn.logcom.co.kr/templates/std_back.png', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, company_id, department_id, username, password, name, email, phone, status) VALUES
    (1, 2, 3, 'kim_minjun', 'MTIzNA==', '김민준', 'minjun@cheil.co.kr', '010-2451-8821', 'ACTIVE'),
    (2, 1, 1, 'lee_seoyeon', 'MTIzNA==', '이서연', 'seoyeon@logcom.co.kr', '010-7392-1048', 'ACTIVE'),
    (3, 2, 4, 'park_jihoon', 'MTIzNA==', '박지훈', 'jihoon@cheil.co.kr', '010-5631-9074', 'ACTIVE'),
    (4, 1, 2, 'choi_sua', 'MTIzNA==', '최수아', 'sua@logcom.co.kr', '010-8164-3320', 'ACTIVE'),
    (5, 2, 3, 'jung_woojin', 'MTIzNA==', '정우진', 'woojin@cheil.co.kr', '010-4072-6651', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;


-- 2. 샘플 주문 데이터 5건 생성 (1 ~ 5)
-- 1번 주문: 검수대기 (PENDING)
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    1,
    'ORD-20260728-8821',
    2,
    1,
    1,
    'PENDING',
    '김민준',
    '010-2451-8821',
    '06779',
    '서울시 서초구 방배천로 22-6',
    '9층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    1,
    1,
    '{"name": "김민준", "department": "고속도로사업부", "title": "이사", "phone": "010-2451-8821", "email": "minjun@cheil.co.kr"}'::jsonb,
    '휘라레 216g / 2000매',
    'https://cdn.logcom.co.kr/previews/501_front.png',
    'https://cdn.logcom.co.kr/previews/501_back.png'
) ON CONFLICT (order_id) DO NOTHING;


-- 2번 주문: 검수승인 (APPROVED)
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    2,
    'ORD-20260728-8820',
    1,
    2,
    1,
    'APPROVED',
    '이서연',
    '010-7392-1048',
    '13494',
    '경기도 성남시 분당구 판교역로 166',
    '로그컴 판교 아지트 A동 5층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '5 hours'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    2,
    2,
    '{"name": "이서연", "department": "플랫폼기획팀", "title": "팀장", "phone": "010-7392-1048", "email": "seoyeon@logcom.co.kr"}'::jsonb,
    '스노우지 250g / 500매',
    'https://cdn.logcom.co.kr/previews/502_front.png',
    'https://cdn.logcom.co.kr/previews/502_back.png'
) ON CONFLICT (order_id) DO NOTHING;


-- 3번 주문: 인쇄중 (PRINTING)
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    3,
    'ORD-20260727-8819',
    2,
    3,
    1,
    'PRINTING',
    '박지훈',
    '010-5631-9074',
    '06779',
    '서울시 서초구 방배천로 22-6',
    '8층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    3,
    3,
    '{"name": "박지훈", "department": "토목설계팀", "title": "수석연구원", "phone": "010-5631-9074", "email": "jihoon@cheil.co.kr"}'::jsonb,
    '띤또레또 250g / 1000매',
    'https://cdn.logcom.co.kr/previews/503_front.png',
    'https://cdn.logcom.co.kr/previews/503_back.png'
) ON CONFLICT (order_id) DO NOTHING;


-- 4번 주문: 발송완료 (SHIPPED)
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    4,
    'ORD-20260726-8818',
    1,
    4,
    1,
    'SHIPPED',
    '최수아',
    '010-8164-3320',
    '13494',
    '경기도 성남시 분당구 판교역로 166',
    '로그컴 판교 아지트 B동 10층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    4,
    4,
    '{"name": "최수아", "department": "브랜드디자인팀", "title": "책임", "phone": "010-8164-3320", "email": "sua@logcom.co.kr"}'::jsonb,
    '랑데뷰 240g / 1000매',
    'https://cdn.logcom.co.kr/previews/504_front.png',
    'https://cdn.logcom.co.kr/previews/504_back.png'
) ON CONFLICT (order_id) DO NOTHING;

INSERT INTO shipments (id, order_id, carrier_code, tracking_number, shipped_at)
VALUES (
    1,
    4,
    'CJ대한통운',
    '689204817290',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
) ON CONFLICT (order_id) DO NOTHING;


-- 5번 주문: 승인반려 (REJECTED)
INSERT INTO orders (id, order_no, company_id, member_id, template_id, status, recipient_name, recipient_phone, zipcode, address, address_detail, reject_reason, created_at)
VALUES (
    5,
    'ORD-20260725-8817',
    2,
    5,
    1,
    'REJECTED',
    '정우진',
    '010-4072-6651',
    '06779',
    '서울시 서초구 방배천로 22-6',
    '7층',
    '영문 직급 표기 오타 확인 필요 (Directer -> Director)',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url)
VALUES (
    5,
    5,
    '{"name": "정우진", "department": "해외사업부", "title": "매니저", "phone": "010-4072-6651", "email": "woojin@cheil.co.kr"}'::jsonb,
    '반누보 227g / 500매',
    'https://cdn.logcom.co.kr/previews/505_front.png',
    'https://cdn.logcom.co.kr/previews/505_back.png'
) ON CONFLICT (order_id) DO NOTHING;
