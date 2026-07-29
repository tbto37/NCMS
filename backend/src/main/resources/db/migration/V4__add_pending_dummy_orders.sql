-- ========================================================
-- 승인대기(PENDING) 상태 샘플 주문 더미 데이터 2건 추가 (BIGINT ID 사용)
-- ========================================================

-- 승인대기 주문 1: 홍길동 (제일엔지니어링)
INSERT INTO orders (
    id, order_no, company_id, member_id, template_id, status,
    recipient_name, recipient_phone, zipcode, address, address_detail,
    reject_reason, created_at
) VALUES (
    6,
    'ORD-20260728-9001',
    2,
    1,
    1,
    'PENDING',
    '홍길동',
    '010-1234-5678',
    '06779',
    '서울시 서초구 방배천로 22-6',
    '10층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (
    id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url
) VALUES (
    6,
    6,
    '{"name": "홍길동", "department": "기술연구소", "title": "수석연구원", "phone": "010-1234-5678", "email": "gildong.hong@cheil.co.kr"}'::jsonb,
    '반누보 227g / 500매',
    'https://cdn.logcom.co.kr/previews/901_front.png',
    'https://cdn.logcom.co.kr/previews/901_back.png'
) ON CONFLICT (order_id) DO NOTHING;


-- 승인대기 주문 2: 강감찬 (로그컴)
INSERT INTO orders (
    id, order_no, company_id, member_id, template_id, status,
    recipient_name, recipient_phone, zipcode, address, address_detail,
    reject_reason, created_at
) VALUES (
    7,
    'ORD-20260728-9002',
    1,
    2,
    1,
    'PENDING',
    '강감찬',
    '010-9876-5432',
    '13494',
    '경기도 성남시 분당구 판교역로 166',
    '로그컴 판교 아지트 7층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '10 minutes'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (
    id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url
) VALUES (
    7,
    7,
    '{"name": "강감찬", "department": "전략기획실", "title": "팀장", "phone": "010-9876-5432", "email": "gamchan.kang@logcom.co.kr"}'::jsonb,
    '휘라레 216g / 200매',
    'https://cdn.logcom.co.kr/previews/902_front.png',
    'https://cdn.logcom.co.kr/previews/902_back.png'
) ON CONFLICT (order_id) DO NOTHING;
