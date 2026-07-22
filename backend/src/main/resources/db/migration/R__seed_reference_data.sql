-- NCMS Reference Data (Repeatable Migration)

MERGE INTO roles (code, name, description, sort_order)
KEY (code)
VALUES 
    ('EMPLOYEE', '일반 임직원', '템플릿 선택, 본인 명함 편집·주문, 본인 주문 조회, 반려 주문 수정, 재주문', 1),
    ('COMPANY_ADMIN', '기업 관리자', '소속 고객사의 주문 조회, 승인·반려, 회원·부서 관리, 엑셀 다운로드', 2),
    ('OPERATOR', '로그컴 운영자', '전체 또는 배정 고객사 주문 조회, 인쇄 파일 처리, 제작 상태 변경, 송장 등록, 발송 처리', 3),
    ('SYSTEM_ADMIN', '시스템 관리자', '고객사·부서·회원·권한·템플릿·상품 옵션·운영계정·정책 관리', 4);
