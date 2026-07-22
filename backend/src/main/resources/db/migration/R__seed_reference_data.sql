-- 애플리케이션이 동작하기 위해 필요한 최소 기준데이터
-- Flyway repeatable migration: 내용 변경 시 재실행된다.

INSERT INTO roles (code, name, description, sort_order, is_system)
VALUES
    ('EMPLOYEE', '일반 임직원', '본인 명함 편집·주문·조회·재주문', 10, true),
    ('COMPANY_ADMIN', '기업 관리자', '소속 고객사 주문 승인·반려 및 회원·부서 관리', 20, true),
    ('OPERATOR', '로그컴 운영자', '고객사 주문 제작·인쇄·배송 처리', 30, true),
    ('SYSTEM_ADMIN', '시스템 관리자', '고객사·템플릿·상품·권한·운영 정책 관리', 40, true)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_system = EXCLUDED.is_system;
