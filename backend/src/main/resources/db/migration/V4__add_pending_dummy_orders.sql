-- ========================================================
-- 승인대기(PENDING) 상태 샘플 주문 더미 데이터 2건 추가
-- ========================================================

-- 승인대기 주문 1: 홍길동 (제일엔지니어링)
INSERT INTO orders (
    id, order_no, company_id, member_id, template_id, status,
    recipient_name, recipient_phone, zipcode, address, address_detail,
    reject_reason, created_at
) VALUES (
    'O_PENDING_1',
    'ORD-20260728-9001',
    'C_2',
    'M_1',
    'T_1',
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
    'S_PENDING_1',
    'O_PENDING_1',
    '{"name": "홍길동", "department": "기술연구소", "title": "수석연구원", "phone": "010-1234-5678", "email": "gildong.hong@cheil.co.kr"}'::jsonb,
    '반누보 227g / 500매',
    'https://cdn.logcom.co.kr/previews/901_front.png',
    'https://cdn.logcom.co.kr/previews/901_back.png'
) ON CONFLICT (order_id) DO NOTHING;


-- 승인대기 주문 2: 강감찬 ((주)투비더원)
INSERT INTO orders (
    id, order_no, company_id, member_id, template_id, status,
    recipient_name, recipient_phone, zipcode, address, address_detail,
    reject_reason, created_at
) VALUES (
    'O_PENDING_2',
    'ORD-20260728-9002',
    'C_1',
    'M_2',
    'T_1',
    'PENDING',
    '강감찬',
    '010-9876-5432',
    '13494',
    '경기도 성남시 분당구 판교역로 166',
    '투비더원 판교 아지트 7층',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '10 minutes'
) ON CONFLICT (order_no) DO NOTHING;

INSERT INTO order_snapshots (
    id, order_id, card_data, product_option_summary, preview_front_url, preview_back_url
) VALUES (
    'S_PENDING_2',
    'O_PENDING_2',
    '{"name": "강감찬", "department": "전략기획실", "title": "팀장", "phone": "010-9876-5432", "email": "gamchan.kang@tobetheone.com"}'::jsonb,
    '휘라레 216g / 200매',
    'https://cdn.logcom.co.kr/previews/902_front.png',
    'https://cdn.logcom.co.kr/previews/902_back.png'
) ON CONFLICT (order_id) DO NOTHING;
