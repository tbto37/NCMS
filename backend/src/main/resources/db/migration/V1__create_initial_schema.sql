-- ================================================================
-- NCMS PostgreSQL v1 Initial Schema
-- Generated from: docs/database/ncms-database-design-v0.1.md
-- Version: v0.1
-- Date: 2026-07-22
-- ================================================================

-- ================================================================
-- 1. COMPANIES & DEPARTMENTS
-- ================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,
    site_code VARCHAR(50) NOT NULL UNIQUE,
    business_number VARCHAR(20),
    logo_file_key VARCHAR(500),
    primary_color VARCHAR(20),

    -- Policies
    approval_policy VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',
    shipping_address_policy VARCHAR(50) NOT NULL DEFAULT 'COMPANY_FIXED',
    price_visibility VARCHAR(50) NOT NULL DEFAULT 'HIDDEN',

    -- Default shipping address
    default_recipient_name VARCHAR(100),
    default_recipient_phone VARCHAR(20),
    default_postal_code VARCHAR(10),
    default_address_line1 VARCHAR(500),
    default_address_line2 VARCHAR(500),

    -- Contact
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT chk_companies_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_companies_site_code ON companies(site_code);
CREATE INDEX idx_companies_status ON companies(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE companies IS '고객사 기본정보 및 운영 정책';

-- ================================================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    parent_department_id UUID,
    department_name VARCHAR(100) NOT NULL,
    depth INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT fk_departments_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_departments_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    CONSTRAINT chk_departments_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_departments_company ON departments(company_id, status);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);

COMMENT ON TABLE departments IS '고객사별 계층형 부서';

-- ================================================================
-- 2. MEMBERS & ROLES
-- ================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_code ON roles(role_code);

COMMENT ON TABLE roles IS '시스템 역할 기준정보';

-- ================================================================

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    department_id UUID,

    -- Account
    login_id VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile
    member_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    mobile VARCHAR(20),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    locked_until TIMESTAMPTZ,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT fk_members_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_members_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT chk_members_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'RESIGNED'))
);

CREATE INDEX idx_members_login_id ON members(login_id);
CREATE INDEX idx_members_company ON members(company_id, status);
CREATE INDEX idx_members_department ON members(department_id);
CREATE INDEX idx_members_status ON members(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE members IS '회원 계정 및 프로필';

-- ================================================================

CREATE TABLE member_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    role_id UUID NOT NULL,

    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,

    CONSTRAINT fk_member_roles_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_member_roles_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT uq_member_roles UNIQUE (member_id, role_id)
);

CREATE INDEX idx_member_roles_member ON member_roles(member_id);
CREATE INDEX idx_member_roles_role ON member_roles(role_id);

COMMENT ON TABLE member_roles IS '회원별 역할 부여';

-- ================================================================

CREATE TABLE member_company_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    company_id UUID NOT NULL,

    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,

    CONSTRAINT fk_member_scopes_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_member_scopes_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT uq_member_scopes UNIQUE (member_id, company_id)
);

CREATE INDEX idx_member_scopes_member ON member_company_scopes(member_id);
CREATE INDEX idx_member_scopes_company ON member_company_scopes(company_id);

COMMENT ON TABLE member_company_scopes IS '내부 운영자의 담당 고객사 범위';

-- ================================================================

CREATE TABLE approval_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    department_id UUID,
    approver_member_id UUID NOT NULL,
    approval_scope VARCHAR(50) NOT NULL,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT fk_approval_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_approval_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_approval_approver FOREIGN KEY (approver_member_id) REFERENCES members(id),
    CONSTRAINT chk_approval_scope CHECK (approval_scope IN ('COMPANY', 'DEPARTMENT'))
);

CREATE INDEX idx_approval_company ON approval_assignments(company_id);
CREATE INDEX idx_approval_department ON approval_assignments(department_id);
CREATE INDEX idx_approval_approver ON approval_assignments(approver_member_id);

COMMENT ON TABLE approval_assignments IS '고객사 또는 부서 단위 승인자 지정';

-- ================================================================
-- 3. AUTHENTICATION
-- ================================================================

CREATE TABLE auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID,
    revoke_reason VARCHAR(200),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX idx_refresh_tokens_member ON auth_refresh_tokens(member_id);
CREATE INDEX idx_refresh_tokens_expires ON auth_refresh_tokens(expires_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE auth_refresh_tokens IS '리프레시 토큰 저장 및 폐기 관리';

-- ================================================================

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX idx_password_reset_member ON password_reset_tokens(member_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

COMMENT ON TABLE password_reset_tokens IS '비밀번호 초기화 일회용 토큰';

-- ================================================================

CREATE TABLE login_histories (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID,
    login_id VARCHAR(100) NOT NULL,

    ip_address VARCHAR(50),
    user_agent TEXT,

    login_status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(200),

    logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_login_histories_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT chk_login_status CHECK (login_status IN ('SUCCESS', 'FAILURE', 'LOCKED'))
);

CREATE INDEX idx_login_histories_member ON login_histories(member_id, logged_at DESC);
CREATE INDEX idx_login_histories_login_id ON login_histories(login_id, logged_at DESC);
CREATE INDEX idx_login_histories_status ON login_histories(login_status, logged_at DESC);

COMMENT ON TABLE login_histories IS '로그인 성공·실패·잠금 이력';

-- ================================================================
-- 4. PRODUCTS (MATERIALS & QUANTITY OPTIONS)
-- ================================================================

CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_name VARCHAR(100) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_materials_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_materials_code ON materials(material_code);
CREATE INDEX idx_materials_status ON materials(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE materials IS '명함 재질 기준정보';

-- ================================================================

CREATE TABLE quantity_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity_value INT NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_quantity_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_quantity_value ON quantity_options(quantity_value);
CREATE INDEX idx_quantity_status ON quantity_options(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE quantity_options IS '주문 수량 기준정보';

-- ================================================================
-- 5. TEMPLATES
-- ================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(50) NOT NULL UNIQUE,
    template_name VARCHAR(200) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT chk_templates_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_templates_code ON templates(template_code);
CREATE INDEX idx_templates_status ON templates(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE templates IS '템플릿 영속 식별자';

-- ================================================================

CREATE TABLE template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    version_no INT NOT NULL,

    version_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    -- Design files
    front_background_file_key VARCHAR(500),
    back_background_file_key VARCHAR(500),

    -- Design schema (JSONB for template layout configuration)
    design_schema JSONB,

    -- Metadata
    change_note TEXT,

    published_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT fk_template_versions_template FOREIGN KEY (template_id) REFERENCES templates(id),
    CONSTRAINT chk_version_status CHECK (version_status IN ('DRAFT', 'PUBLISHED', 'RETIRED'))
);

CREATE UNIQUE INDEX uq_template_versions_template_version ON template_versions(template_id, version_no);
CREATE UNIQUE INDEX uq_template_published ON template_versions(template_id)
    WHERE version_status = 'PUBLISHED';
CREATE INDEX idx_template_versions_template ON template_versions(template_id, version_no DESC);

COMMENT ON TABLE template_versions IS '템플릿 버전별 디자인 및 배경 파일';

-- ================================================================

CREATE TABLE template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL,

    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,

    -- Layout (면, 위치, 크기)
    card_side VARCHAR(10) NOT NULL,
    position_x DECIMAL(10,2),
    position_y DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),

    -- Style
    font_family VARCHAR(100),
    font_size INT,
    font_weight VARCHAR(20),
    font_color VARCHAR(20),
    text_align VARCHAR(20),

    -- Validation
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    max_length INT,
    validation_pattern VARCHAR(500),

    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_template_fields_version FOREIGN KEY (template_version_id) REFERENCES template_versions(id),
    CONSTRAINT chk_field_card_side CHECK (card_side IN ('FRONT', 'BACK')),
    CONSTRAINT chk_field_type CHECK (field_type IN ('TEXT', 'EMAIL', 'PHONE', 'URL', 'TEXTAREA'))
);

CREATE INDEX idx_template_fields_version ON template_fields(template_version_id, sort_order);

COMMENT ON TABLE template_fields IS '템플릿 버전별 편집 필드 및 배치 정보';

-- ================================================================
-- 6. COMPANY TEMPLATES & OPTIONS
-- ================================================================

CREATE TABLE company_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    template_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,

    CONSTRAINT fk_company_templates_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_company_templates_template FOREIGN KEY (template_id) REFERENCES templates(id),
    CONSTRAINT uq_company_templates UNIQUE (company_id, template_id)
);

CREATE INDEX idx_company_templates_company ON company_templates(company_id, status);
CREATE INDEX idx_company_templates_template ON company_templates(template_id);

COMMENT ON TABLE company_templates IS '고객사별 사용 가능 템플릿';

-- ================================================================

CREATE TABLE company_template_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_template_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity_option_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT fk_template_options_company_template FOREIGN KEY (company_template_id) REFERENCES company_templates(id),
    CONSTRAINT fk_template_options_material FOREIGN KEY (material_id) REFERENCES materials(id),
    CONSTRAINT fk_template_options_quantity FOREIGN KEY (quantity_option_id) REFERENCES quantity_options(id),
    CONSTRAINT uq_template_options UNIQUE (company_template_id, material_id, quantity_option_id)
);

CREATE INDEX idx_template_options_company_template ON company_template_options(company_template_id, status);

COMMENT ON TABLE company_template_options IS '고객사 템플릿별 재질·수량 조합';

-- ================================================================
-- 7. PRICE POLICIES
-- ================================================================

CREATE TABLE price_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_template_option_id UUID NOT NULL,

    effective_from DATE NOT NULL,
    effective_to DATE,

    unit_price DECIMAL(12,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT fk_price_policies_option FOREIGN KEY (company_template_option_id) REFERENCES company_template_options(id)
);

CREATE INDEX idx_price_policies_option ON price_policies(company_template_option_id, effective_from DESC);

COMMENT ON TABLE price_policies IS '고객사 템플릿 옵션별 기간별 가격 정책';

-- ================================================================
-- 8. ORDERS
-- ================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    requester_member_id UUID NOT NULL,
    requester_department_id UUID,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Idempotency
    idempotency_key VARCHAR(100),

    -- Approval status
    approval_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',

    -- Production status
    production_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',

    -- Shipping info
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    postal_code VARCHAR(10),
    address_line1 VARCHAR(500),
    address_line2 VARCHAR(500),

    -- Memo
    order_memo TEXT,

    -- Price snapshot
    unit_price DECIMAL(12,2),
    quantity INT,
    subtotal DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'KRW',

    -- Optimistic lock
    version INT NOT NULL DEFAULT 0,

    -- Timestamps
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_orders_requester FOREIGN KEY (requester_member_id) REFERENCES members(id),
    CONSTRAINT fk_orders_department FOREIGN KEY (requester_department_id) REFERENCES departments(id),
    CONSTRAINT chk_approval_status CHECK (approval_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_production_status CHECK (production_status IN ('DRAFT', 'RECEIVED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_cancel_reason CHECK (production_status != 'CANCELLED' OR cancel_reason IS NOT NULL)
);

CREATE UNIQUE INDEX uq_orders_idempotency ON orders(requester_member_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_orders_company_created ON orders(company_id, created_at DESC);
CREATE INDEX idx_orders_requester ON orders(requester_member_id, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_approval_pending ON orders(company_id, requester_department_id, submitted_at)
    WHERE approval_status = 'PENDING';
CREATE INDEX idx_orders_production_status ON orders(production_status, approved_at, created_at)
    WHERE production_status IN ('RECEIVED', 'PRINTING');

COMMENT ON TABLE orders IS '주문 기본정보 및 현재 상태';

-- ================================================================
-- 9. ORDER CARD SNAPSHOTS
-- ================================================================

CREATE TABLE order_card_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    company_id UUID NOT NULL,

    -- Template snapshot
    template_id UUID NOT NULL,
    template_version_id UUID NOT NULL,
    template_data JSONB NOT NULL,

    -- Card data (명함 입력 정보)
    card_data JSONB NOT NULL,

    -- Product snapshot
    material_id UUID NOT NULL,
    quantity_option_id UUID NOT NULL,
    product_data JSONB,

    -- Hash for verification
    content_hash VARCHAR(64) NOT NULL,

    -- Preview files
    front_preview_file_key VARCHAR(500),
    back_preview_file_key VARCHAR(500),

    is_current BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_snapshots_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_snapshots_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_snapshots_template FOREIGN KEY (template_id) REFERENCES templates(id),
    CONSTRAINT fk_snapshots_template_version FOREIGN KEY (template_version_id) REFERENCES template_versions(id),
    CONSTRAINT fk_snapshots_material FOREIGN KEY (material_id) REFERENCES materials(id),
    CONSTRAINT fk_snapshots_quantity FOREIGN KEY (quantity_option_id) REFERENCES quantity_options(id)
);

CREATE UNIQUE INDEX uq_snapshots_current ON order_card_snapshots(order_id) WHERE is_current = TRUE;
CREATE INDEX idx_snapshots_order ON order_card_snapshots(order_id);
CREATE INDEX idx_snapshots_card_data ON order_card_snapshots USING GIN(card_data);

COMMENT ON TABLE order_card_snapshots IS '주문 당시 명함·템플릿·상품·가격 스냅샷';

-- ================================================================
-- 10. PROOF CONFIRMATIONS
-- ================================================================

CREATE TABLE proof_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_card_snapshot_id UUID NOT NULL,

    confirmed_by UUID NOT NULL,

    typo_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    contact_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    design_confirmed BOOLEAN NOT NULL DEFAULT FALSE,

    content_hash VARCHAR(64) NOT NULL,

    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    invalidated_at TIMESTAMPTZ,
    invalidate_reason VARCHAR(200),

    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_proof_snapshot FOREIGN KEY (order_card_snapshot_id) REFERENCES order_card_snapshots(id),
    CONSTRAINT fk_proof_confirmer FOREIGN KEY (confirmed_by) REFERENCES members(id)
);

CREATE INDEX idx_proof_snapshot ON proof_confirmations(order_card_snapshot_id, confirmed_at DESC);
CREATE INDEX idx_proof_confirmer ON proof_confirmations(confirmed_by);

COMMENT ON TABLE proof_confirmations IS '교정 확인 이력 및 무효화';

-- ================================================================
-- 11. ORDER APPROVALS
-- ================================================================

CREATE TABLE order_approvals (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    company_id UUID NOT NULL,

    approval_action VARCHAR(50) NOT NULL,

    approver_member_id UUID,
    approval_comment TEXT,
    rejection_reason TEXT,

    actioned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_approvals_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_approvals_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_order_approvals_approver FOREIGN KEY (approver_member_id) REFERENCES members(id),
    CONSTRAINT chk_approval_action CHECK (approval_action IN ('SUBMITTED', 'RESUBMITTED', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_rejection_reason CHECK (approval_action != 'REJECTED' OR rejection_reason IS NOT NULL)
);

CREATE INDEX idx_order_approvals_order ON order_approvals(order_id, actioned_at DESC);
CREATE INDEX idx_order_approvals_approver ON order_approvals(approver_member_id, actioned_at DESC);

COMMENT ON TABLE order_approvals IS '주문 승인·반려·재상신 이력';

-- ================================================================
-- 12. ORDER STATUS HISTORIES
-- ================================================================

CREATE TABLE order_status_histories (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    company_id UUID NOT NULL,

    status_type VARCHAR(20) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,

    changed_by UUID,
    change_reason TEXT,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_histories_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_status_histories_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_status_histories_changer FOREIGN KEY (changed_by) REFERENCES members(id),
    CONSTRAINT chk_status_type CHECK (status_type IN ('APPROVAL', 'PRODUCTION'))
);

CREATE INDEX idx_status_histories_order ON order_status_histories(order_id, changed_at DESC);
CREATE INDEX idx_status_histories_changer ON order_status_histories(changed_by, changed_at DESC);

COMMENT ON TABLE order_status_histories IS '주문 상태 변경 이력 (승인/제작)';

-- ================================================================
-- 13. PRODUCTION JOBS
-- ================================================================

CREATE TABLE production_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    company_id UUID NOT NULL,

    assigned_to UUID,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,

    production_memo TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_production_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_production_assignee FOREIGN KEY (assigned_to) REFERENCES members(id)
);

CREATE INDEX idx_production_order ON production_jobs(order_id);
CREATE INDEX idx_production_assignee ON production_jobs(assigned_to);

COMMENT ON TABLE production_jobs IS '제작 작업 정보 및 담당자';

-- ================================================================
-- 14. PRINT FILES
-- ================================================================

CREATE TABLE print_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    company_id UUID NOT NULL,

    file_type VARCHAR(20) NOT NULL,
    version_no INT NOT NULL DEFAULT 1,

    storage_provider VARCHAR(50) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64),

    is_used_for_print BOOLEAN NOT NULL DEFAULT FALSE,

    generation_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT fk_print_files_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_print_files_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_print_files_creator FOREIGN KEY (created_by) REFERENCES members(id),
    CONSTRAINT chk_file_type CHECK (file_type IN ('PREVIEW', 'PRINT_PDF'))
);

CREATE UNIQUE INDEX uq_print_files_used ON print_files(order_id)
    WHERE is_used_for_print = TRUE AND file_type = 'PRINT_PDF';
CREATE INDEX idx_print_files_order ON print_files(order_id, version_no DESC);

COMMENT ON TABLE print_files IS '인쇄용 PDF 및 미리보기 파일 버전 관리';

-- ================================================================

CREATE TABLE print_file_downloads (
    id BIGSERIAL PRIMARY KEY,
    print_file_id UUID NOT NULL,

    downloaded_by UUID NOT NULL,
    download_ip VARCHAR(50),

    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_downloads_file FOREIGN KEY (print_file_id) REFERENCES print_files(id),
    CONSTRAINT fk_downloads_downloader FOREIGN KEY (downloaded_by) REFERENCES members(id)
);

CREATE INDEX idx_downloads_file ON print_file_downloads(print_file_id, downloaded_at DESC);
CREATE INDEX idx_downloads_downloader ON print_file_downloads(downloaded_by, downloaded_at DESC);

COMMENT ON TABLE print_file_downloads IS '인쇄 파일 다운로드 감사 이력';

-- ================================================================
-- 15. SHIPMENTS
-- ================================================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    company_id UUID NOT NULL,

    shipping_method VARCHAR(50) NOT NULL,
    carrier_code VARCHAR(50),
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(100),

    shipment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_shipments_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT chk_shipping_method CHECK (shipping_method IN ('COURIER', 'DIRECT', 'PICKUP')),
    CONSTRAINT chk_shipment_status CHECK (shipment_status IN ('PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'))
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(carrier_code, tracking_number);

COMMENT ON TABLE shipments IS '배송정보 및 송장';

-- ================================================================

CREATE TABLE shipment_histories (
    id BIGSERIAL PRIMARY KEY,
    shipment_id UUID NOT NULL,

    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,

    changed_by UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shipment_histories_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id),
    CONSTRAINT fk_shipment_histories_changer FOREIGN KEY (changed_by) REFERENCES members(id)
);

CREATE INDEX idx_shipment_histories_shipment ON shipment_histories(shipment_id, changed_at DESC);

COMMENT ON TABLE shipment_histories IS '배송정보 및 송장 변경 이력';

-- ================================================================
-- 16. NOTIFICATIONS
-- ================================================================

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,

    template_code VARCHAR(50) NOT NULL,
    template_name VARCHAR(200) NOT NULL,

    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_templates_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_notification_templates_code ON notification_templates(template_code);
CREATE INDEX idx_notification_templates_company ON notification_templates(company_id);

COMMENT ON TABLE notification_templates IS '공통 또는 고객사별 이메일 템플릿';

-- ================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    company_id UUID,

    notification_type VARCHAR(50) NOT NULL,

    recipient_email VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100),

    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_notifications_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT chk_notification_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_notifications_order ON notifications(order_id, created_at DESC);
CREATE INDEX idx_notifications_status_scheduled ON notifications(status, scheduled_at)
    WHERE status = 'PENDING';

COMMENT ON TABLE notifications IS '이메일 발송 큐 및 결과 이력';

-- ================================================================
-- 17. AUDIT LOGS
-- ================================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,

    actor_member_id UUID,
    actor_ip VARCHAR(50),

    before_data JSONB,
    after_data JSONB,
    change_summary TEXT,

    performed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_member_id) REFERENCES members(id)
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, performed_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_member_id, performed_at DESC);
CREATE INDEX idx_audit_logs_performed ON audit_logs(performed_at DESC);

COMMENT ON TABLE audit_logs IS '관리자 변경 전후 데이터 감사 이력';

-- ================================================================
-- END OF SCHEMA
-- ================================================================
