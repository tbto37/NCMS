-- NCMS Initial Schema DDL (MVP 10 Core Tables)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 고객사 (companies)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(10) DEFAULT '#000000',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE companies IS '고객사 메타 및 동적 브랜딩 정보';
COMMENT ON COLUMN companies.id IS '고객사 고유 식별자 (UUID)';
COMMENT ON COLUMN companies.site_code IS '고객사 고유 사이트 코드 (URL 세그먼트용, 예: kakao, samsung)';
COMMENT ON COLUMN companies.name IS '고객사 공식 회사명';
COMMENT ON COLUMN companies.logo_url IS '고객사 헤더 노출용 로고 이미지 URL';
COMMENT ON COLUMN companies.primary_color IS '고객사 대표 브랜드 HEX 색상 코드 (예: #FEE500)';
COMMENT ON COLUMN companies.status IS '고객사 상태 (ACTIVE: 활성, INACTIVE: 비활성)';
COMMENT ON COLUMN companies.created_at IS '레코드 생성일시';
COMMENT ON COLUMN companies.updated_at IS '레코드 수정일시';


-- 2. 부서 (departments)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE departments IS '고객사 부서 정보';
COMMENT ON COLUMN departments.id IS '부서 고유 식별자 (UUID)';
COMMENT ON COLUMN departments.company_id IS '소속 고객사 ID';
COMMENT ON COLUMN departments.name IS '부서명';
COMMENT ON COLUMN departments.sort_order IS '정렬 순서';
COMMENT ON COLUMN departments.status IS '부서 상태 (ACTIVE: 활성, INACTIVE: 비활성)';
COMMENT ON COLUMN departments.created_at IS '레코드 생성일시';
COMMENT ON COLUMN departments.updated_at IS '레코드 수정일시';


-- 3. 회원 (members)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE members IS '사용자 회원 정보 (임직원/기업관리자/로그컴운영자/시스템관리자)';
COMMENT ON COLUMN members.id IS '회원 고유 식별자 (UUID)';
COMMENT ON COLUMN members.company_id IS '소속 고객사 ID (내부 운영자/시스템관리자는 NULL 가능)';
COMMENT ON COLUMN members.department_id IS '소속 부서 ID';
COMMENT ON COLUMN members.username IS '로그인 아이디';
COMMENT ON COLUMN members.password IS '암호화된 비밀번호';
COMMENT ON COLUMN members.name IS '사용자 이름';
COMMENT ON COLUMN members.email IS '이메일 주소';
COMMENT ON COLUMN members.phone IS '연락처/휴대전화 번호';
COMMENT ON COLUMN members.status IS '회원 상태 (ACTIVE: 활성, INACTIVE: 사용중지)';
COMMENT ON COLUMN members.created_at IS '레코드 생성일시';
COMMENT ON COLUMN members.updated_at IS '레코드 수정일시';


-- 4. 역할 (roles) & 회원 역할 (member_roles)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

COMMENT ON TABLE roles IS '시스템 역할 기준 정보';
COMMENT ON COLUMN roles.id IS '역할 고유 식별자 (UUID)';
COMMENT ON COLUMN roles.code IS '역할 코드 (ROLE_SYSTEM_ADMIN, ROLE_COMPANY_ADMIN, ROLE_EMPLOYEE, ROLE_OPERATOR)';
COMMENT ON COLUMN roles.name IS '역할 명칭';


CREATE TABLE member_roles (
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, role_id)
);

COMMENT ON TABLE member_roles IS '회원-역할 매핑 정보';
COMMENT ON COLUMN member_roles.member_id IS '회원 ID';
COMMENT ON COLUMN member_roles.role_id IS '역할 ID';


-- 5. 명함 템플릿 (templates)
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    preview_front_url VARCHAR(500),
    preview_back_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE templates IS '명함 디자인 템플릿 정보';
COMMENT ON COLUMN templates.id IS '템플릿 고유 식별자 (UUID)';
COMMENT ON COLUMN templates.name IS '템플릿 명칭';
COMMENT ON COLUMN templates.preview_front_url IS '앞면 기본 미리보기 이미지 URL';
COMMENT ON COLUMN templates.preview_back_url IS '뒷면 기본 미리보기 이미지 URL';
COMMENT ON COLUMN templates.status IS '템플릿 상태 (ACTIVE: 활성, INACTIVE: 비활성)';
COMMENT ON COLUMN templates.created_at IS '레코드 생성일시';
COMMENT ON COLUMN templates.updated_at IS '레코드 수정일시';


-- 6. 고객사 템플릿 연결 (company_templates)
CREATE TABLE company_templates (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, template_id)
);

COMMENT ON TABLE company_templates IS '고객사별 배정 템플릿 매핑 정보';
COMMENT ON COLUMN company_templates.company_id IS '고객사 ID';
COMMENT ON COLUMN company_templates.template_id IS '템플릿 ID';


-- 7. 명함 상품 옵션 (product_options)
CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_options IS '명함 상품 옵션 (용지 재질 및 주문 수량)';
COMMENT ON COLUMN product_options.id IS '상품 옵션 고유 식별자 (UUID)';
COMMENT ON COLUMN product_options.material_name IS '명함 용지 재질명 (예: 스노우지 250g, 띤또레또 250g)';
COMMENT ON COLUMN product_options.quantity IS '주문 수량 (매)';
COMMENT ON COLUMN product_options.status IS '옵션 상태 (ACTIVE: 활성, INACTIVE: 비활성)';
COMMENT ON COLUMN product_options.created_at IS '레코드 생성일시';
COMMENT ON COLUMN product_options.updated_at IS '레코드 수정일시';


-- 8. 명함 주문 (orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id),
    member_id UUID NOT NULL REFERENCES members(id),
    template_id UUID NOT NULL REFERENCES templates(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    recipient_name VARCHAR(50) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    zipcode VARCHAR(10),
    address VARCHAR(255) NOT NULL,
    address_detail VARCHAR(255),
    reject_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE orders IS '명함 주문 기본 정보';
COMMENT ON COLUMN orders.id IS '주문 고유 식별자 (UUID)';
COMMENT ON COLUMN orders.order_no IS '주문 번호 (예: ORD-20260725-XXXXXX)';
COMMENT ON COLUMN orders.company_id IS '주문 고객사 ID';
COMMENT ON COLUMN orders.member_id IS '주문 임직원 ID';
COMMENT ON COLUMN orders.template_id IS '선택 템플릿 ID';
COMMENT ON COLUMN orders.status IS '통합 주문 상태 (PENDING: 검수대기, APPROVED: 검수승인, REJECTED: 반려, PRINTING: 인쇄중, SHIPPED: 발송완료, DELIVERED: 배송완료, CANCELLED: 취소)';
COMMENT ON COLUMN orders.recipient_name IS '수령인 이름';
COMMENT ON COLUMN orders.recipient_phone IS '수령인 연락처';
COMMENT ON COLUMN orders.zipcode IS '우편번호';
COMMENT ON COLUMN orders.address IS '기본 배송지 주소';
COMMENT ON COLUMN orders.address_detail IS '상세 배송지 주소';
COMMENT ON COLUMN orders.reject_reason IS '로그컴 운영자 검수 반려 사유';
COMMENT ON COLUMN orders.created_at IS '주문 접수일시';
COMMENT ON COLUMN orders.updated_at IS '주문 정보 수정일시';


-- 9. 명함 주문 데이터 스냅샷 (order_snapshots)
CREATE TABLE order_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    card_data JSONB NOT NULL,
    product_option_summary VARCHAR(200),
    preview_front_url VARCHAR(500),
    preview_back_url VARCHAR(500),
    print_pdf_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_snapshots IS '주문 당시 명함 데이터 및 파일 스냅샷';
COMMENT ON COLUMN order_snapshots.id IS '스냅샷 고유 식별자 (UUID)';
COMMENT ON COLUMN order_snapshots.order_id IS '주문 ID';
COMMENT ON COLUMN order_snapshots.card_data IS '주문 당시 입력한 명함 문구 데이터 (JSONB)';
COMMENT ON COLUMN order_snapshots.product_option_summary IS '선택 상품 옵션 요약 (용지 재질, 수량 등)';
COMMENT ON COLUMN order_snapshots.preview_front_url IS '주문 당시 확정된 앞면 미리보기 이미지 URL';
COMMENT ON COLUMN order_snapshots.preview_back_url IS '주문 당시 확정된 뒷면 미리보기 이미지 URL';
COMMENT ON COLUMN order_snapshots.print_pdf_url IS '인쇄 제작용 PDF 파일 URL';
COMMENT ON COLUMN order_snapshots.created_at IS '스냅샷 생성일시';


-- 10. 배송 정보 (shipments)
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    carrier_code VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    shipped_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE shipments IS '주문 배송 및 송장 정보';
COMMENT ON COLUMN shipments.id IS '배송 정보 고유 식별자 (UUID)';
COMMENT ON COLUMN shipments.order_id IS '주문 ID';
COMMENT ON COLUMN shipments.carrier_code IS '택배사 코드';
COMMENT ON COLUMN shipments.tracking_number IS '운송장 번호';
COMMENT ON COLUMN shipments.shipped_at IS '발송 일시';
