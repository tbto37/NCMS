-- ================================================================
-- NCMS Repeatable Migration - Reference Data
-- Generated from: docs/database/ncms-database-design-v0.1.md
-- Version: v0.1
-- Date: 2026-07-22
--
-- This file seeds reference data and can be re-run safely.
-- ================================================================

-- ================================================================
-- 1. ROLES (시스템 역할)
-- ================================================================

INSERT INTO roles (id, role_code, role_name, description, sort_order, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'EMPLOYEE', '일반 임직원', '템플릿 선택, 본인 명함 편집·주문, 본인 주문 조회, 반려 주문 수정, 재주문', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000002', 'COMPANY_ADMIN', '기업 관리자', '소속 고객사의 주문 조회, 승인·반려, 회원·부서 관리, 엑셀 다운로드', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000003', 'OPERATOR', '로그컴 운영자', '전체 또는 배정 고객사 주문 조회, 인쇄 파일 처리, 제작 상태 변경, 송장 등록, 발송 처리', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000004', 'SYSTEM_ADMIN', '시스템 관리자', '고객사·부서·회원·권한·템플릿·상품 옵션·운영계정·정책 관리', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 2. MATERIALS (재질 기준정보)
-- ================================================================

INSERT INTO materials (id, material_code, material_name, description, status, sort_order, created_at, updated_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'STANDARD', '일반지', '표준 명함 용지', 'ACTIVE', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000002', 'PREMIUM', '고급지', '프리미엄 명함 용지', 'ACTIVE', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000003', 'THICK', '두꺼운지', '두꺼운 명함 용지', 'ACTIVE', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000004', 'COATED', '코팅지', '코팅 처리된 명함 용지', 'ACTIVE', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (material_code) DO UPDATE SET
    material_name = EXCLUDED.material_name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 3. QUANTITY OPTIONS (수량 기준정보)
-- ================================================================

INSERT INTO quantity_options (id, quantity_value, display_name, status, sort_order, created_at, updated_at)
VALUES
    ('20000000-0000-0000-0000-000000000001', 100, '100매', 'ACTIVE', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000002', 200, '200매', 'ACTIVE', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000003', 500, '500매', 'ACTIVE', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000004', 1000, '1000매', 'ACTIVE', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000005', 2000, '2000매', 'ACTIVE', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (quantity_value) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 4. NOTIFICATION TEMPLATES (공통 이메일 템플릿)
-- ================================================================

INSERT INTO notification_templates (id, company_id, template_code, template_name, subject_template, body_template, status, created_at, updated_at)
VALUES
    -- 주문 접수 알림
    ('30000000-0000-0000-0000-000000000001', NULL, 'ORDER_SUBMITTED', '주문 접수 알림',
     '[NCMS] 명함 주문이 접수되었습니다 - {{orderNumber}}',
     '안녕하세요, {{memberName}}님.\n\n명함 주문이 정상적으로 접수되었습니다.\n\n주문번호: {{orderNumber}}\n주문일시: {{submittedAt}}\n\n감사합니다.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 승인 요청 알림
    ('30000000-0000-0000-0000-000000000002', NULL, 'APPROVAL_REQUESTED', '승인 요청 알림',
     '[NCMS] 명함 주문 승인이 필요합니다 - {{orderNumber}}',
     '안녕하세요.\n\n{{requesterName}}님의 명함 주문 승인이 필요합니다.\n\n주문번호: {{orderNumber}}\n주문자: {{requesterName}}\n부서: {{departmentName}}\n\n승인 페이지에서 확인해주세요.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 승인 완료 알림
    ('30000000-0000-0000-0000-000000000003', NULL, 'ORDER_APPROVED', '승인 완료 알림',
     '[NCMS] 명함 주문이 승인되었습니다 - {{orderNumber}}',
     '안녕하세요, {{memberName}}님.\n\n명함 주문이 승인되었습니다.\n\n주문번호: {{orderNumber}}\n승인자: {{approverName}}\n승인일시: {{approvedAt}}\n\n곧 제작에 들어갑니다.\n\n감사합니다.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 승인 반려 알림
    ('30000000-0000-0000-0000-000000000004', NULL, 'ORDER_REJECTED', '승인 반려 알림',
     '[NCMS] 명함 주문이 반려되었습니다 - {{orderNumber}}',
     '안녕하세요, {{memberName}}님.\n\n명함 주문이 반려되었습니다.\n\n주문번호: {{orderNumber}}\n반려자: {{approverName}}\n반려일시: {{rejectedAt}}\n반려 사유: {{rejectionReason}}\n\n주문을 수정하여 다시 제출해주세요.\n\n감사합니다.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 발송 완료 알림
    ('30000000-0000-0000-0000-000000000005', NULL, 'ORDER_SHIPPED', '발송 완료 알림',
     '[NCMS] 명함이 발송되었습니다 - {{orderNumber}}',
     '안녕하세요, {{memberName}}님.\n\n명함이 발송되었습니다.\n\n주문번호: {{orderNumber}}\n택배사: {{carrierName}}\n송장번호: {{trackingNumber}}\n발송일시: {{shippedAt}}\n\n배송 조회: {{trackingUrl}}\n\n감사합니다.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 주문 취소 알림
    ('30000000-0000-0000-0000-000000000006', NULL, 'ORDER_CANCELLED', '주문 취소 알림',
     '[NCMS] 명함 주문이 취소되었습니다 - {{orderNumber}}',
     '안녕하세요, {{memberName}}님.\n\n명함 주문이 취소되었습니다.\n\n주문번호: {{orderNumber}}\n취소일시: {{cancelledAt}}\n취소 사유: {{cancelReason}}\n\n감사합니다.',
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (template_code) DO UPDATE SET
    template_name = EXCLUDED.template_name,
    subject_template = EXCLUDED.subject_template,
    body_template = EXCLUDED.body_template,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- END OF REFERENCE DATA
-- ================================================================
