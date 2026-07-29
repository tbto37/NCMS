-- NCMS Migration V5: 한미글로벌 고객사, 부서, 템플릿(T_CHEIL, T_HANMI) 및 권한/계정 세팅

-- 1. 신규 고객사 등록 (C_3: 한미글로벌 주식회사, site_code: hanmi)
INSERT INTO companies (id, site_code, name, logo_url, primary_color, status) VALUES
    ('C_3', 'hanmi', '한미글로벌 주식회사', 'https://cdn.logcom.co.kr/logos/hanmiglobal.png', '#004B96', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    site_code = EXCLUDED.site_code,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    primary_color = EXCLUDED.primary_color;

-- 2. 부서 등록 (C_3: 한미글로벌)
INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    ('DEP_5', 'C_3', '경영지원팀', 1, 'ACTIVE'),
    ('DEP_6', 'C_3', '비즈니스개발실', 2, 'ACTIVE'),
    ('DEP_7', 'C_3', '하이테크사업부', 3, 'ACTIVE'),
    ('DEP_8', 'C_3', '국내사업부', 4, 'ACTIVE'),
    ('DEP_9', 'C_3', '글로벌사업부', 5, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. 명함 템플릿 신규 등록 (T_CHEIL: 제일엔지니어링, T_HANMI: 한미글로벌)
INSERT INTO templates (id, name, preview_front_url, preview_back_url, status) VALUES
    ('T_CHEIL', '제일엔지니어링 표준 명함', 'https://cdn.logcom.co.kr/templates/cheil_front.png', 'https://cdn.logcom.co.kr/templates/cheil_back.png', 'ACTIVE'),
    ('T_HANMI', '한미글로벌 표준 명함', 'https://cdn.logcom.co.kr/templates/hanmi_front.png', 'https://cdn.logcom.co.kr/templates/hanmi_back.png', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    preview_front_url = EXCLUDED.preview_front_url,
    preview_back_url = EXCLUDED.preview_back_url;

-- 4. 고객사 - 템플릿 매핑 (company_templates)
INSERT INTO company_templates (company_id, template_id) VALUES
    ('C_2', 'T_CHEIL'),
    ('C_3', 'T_HANMI')
ON CONFLICT DO NOTHING;

-- 5. 한미글로벌 테스트 계정 추가 (비밀번호: 1234 엔코딩값)
-- 비밀번호: MTIzNA== (기존 테스트 계정과 동일)
INSERT INTO members (id, company_id, department_id, username, password, name, email, phone, status) VALUES
    ('M_HANMI_ADM', 'C_3', 'DEP_5', 'hanmi_admin', 'MTIzNA==', '한미관리자', 'admin@hanmiglobal.com', '010-9999-8888', 'ACTIVE'),
    ('M_HANMI_EMP', 'C_3', 'DEP_5', 'hanmi_emp', 'MTIzNA==', '백승연', 'baeksy@hanmiglobal.com', '010-6379-1882', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 6. 계정 권한 부여
INSERT INTO member_roles (member_id, role_id) VALUES
    ('M_HANMI_ADM', 'ROLE_COMPANY_ADMIN'),
    ('M_HANMI_EMP', 'ROLE_EMPLOYEE')
ON CONFLICT DO NOTHING;
