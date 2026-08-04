-- NCMS Migration V8: 제일엔지니어링 2번째 명함 템플릿 추가 (cheil_front_name.jpg 적용)

-- 1. 신규 명함 템플릿 등록 (id: 4, 제일엔지니어링 기본 명함)
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    (4, '제일엔지니어링 기본 명함', 'https://cdn.logcom.co.kr/templates/cheil_front.png', 'https://cdn.logcom.co.kr/templates/cheil_back.png', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    preview_front_url = EXCLUDED.preview_front_url,
    preview_back_url = EXCLUDED.preview_back_url;

-- 2. 제일엔지니어링(company_id: 2) 고객사에 신규 템플릿(template_id: 4) 매핑 추가
INSERT INTO company_templates (company_id, template_id) VALUES
    (2, 4)
ON CONFLICT DO NOTHING;
