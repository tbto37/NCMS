-- NCMS Migration V9: 제일엔지니어링 3번째 명함 템플릿 추가 (제일엔지니어링 본사 현장사무실 주소겸용)

-- 1. 신규 명함 템플릿 등록 (id: 5, 제일엔지니어링 본사 현장사무실 주소겸용)
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    (5, '제일엔지니어링 본사 현장사무실 주소겸용', 'https://cdn.logcom.co.kr/templates/cheil_front.png', NULL, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    preview_front_url = EXCLUDED.preview_front_url,
    preview_back_url = EXCLUDED.preview_back_url;

-- 2. 제일엔지니어링(company_id: 2) 고객사에 신규 템플릿(template_id: 5) 매핑 추가
INSERT INTO company_templates (company_id, template_id) VALUES
    (2, 5)
ON CONFLICT DO NOTHING;
