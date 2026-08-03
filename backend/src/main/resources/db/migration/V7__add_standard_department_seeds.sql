-- NCMS Migration V7: 주요 고객사 부서 마스터 시드 데이터 보강 (최신 companyData 데이터셋 100% 매칭)

-- 1. 제일엔지니어링 (company_id: 2) 주요 사업부 및 부서 보강 (14개)
INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    (10, 2, '상하수도사업부', 3, 'ACTIVE'),
    (11, 2, '관리본부', 4, 'ACTIVE'),
    (12, 2, '건설교통연구원/도로·교통연구팀', 5, 'ACTIVE'),
    (13, 2, '해외본부', 6, 'ACTIVE'),
    (14, 2, '안전진단사업부', 7, 'ACTIVE'),
    (15, 2, '스마트 시티 사업단', 8, 'ACTIVE'),
    (16, 2, '도로사업부', 9, 'ACTIVE'),
    (17, 2, '지반사업부', 10, 'ACTIVE'),
    (18, 2, '철도사업부', 11, 'ACTIVE'),
    (19, 2, '환경플랜트사업부', 12, 'ACTIVE'),
    (20, 2, '철도사업부(지반팀)', 13, 'ACTIVE'),
    (21, 2, '교통·ITS사업부', 14, 'ACTIVE'),
    (22, 2, '토목구조사업부', 15, 'ACTIVE'),
    (23, 2, '경영기획본부', 16, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. 한미글로벌 (company_id: 3) 주요 사업부 및 부서 보강 (4개)
INSERT INTO departments (id, company_id, name, sort_order, status) VALUES
    (24, 3, '국내사업부', 6, 'ACTIVE'),
    (25, 3, '하이테크사업부', 7, 'ACTIVE'),
    (26, 3, '글로벌사업부', 8, 'ACTIVE'),
    (27, 3, '엔지니어링실', 9, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. 부서 PK 시퀀스 값 갱신
SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 1));
