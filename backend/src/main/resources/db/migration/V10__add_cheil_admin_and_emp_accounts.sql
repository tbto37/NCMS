-- NCMS Migration V10: 제일엔지니어링 기업 관리자(cheil_admin) 및 테스트 임직원(cheil_emp) 계정 세팅

INSERT INTO members (id, company_id, department_id, username, password, name, email, phone, status) VALUES
    (10, 2, 4, 'cheil_admin', 'MTIzNA==', '제일관리자', 'admin@cheil.co.kr', '010-1111-2222', 'ACTIVE'),
    (11, 2, 3, 'cheil_emp', 'MTIzNA==', '제일임직원', 'emp@cheil.co.kr', '010-2222-3333', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 계정 권한 부여 (2: ROLE_COMPANY_ADMIN, 3: ROLE_EMPLOYEE)
INSERT INTO member_roles (member_id, role_id) VALUES
    (10, 2),
    (11, 3)
ON CONFLICT DO NOTHING;
