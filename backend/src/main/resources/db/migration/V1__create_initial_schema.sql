-- 명함 주문 플랫폼 초기 스키마
-- PostgreSQL 15+ / Spring Boot Flyway 기준

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE SEQUENCE order_no_seq START WITH 1000 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS varchar
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    business_date text;
    sequence_value bigint;
BEGIN
    business_date := to_char(timezone('Asia/Seoul', clock_timestamp()), 'YYYYMMDD');
    sequence_value := nextval('order_no_seq');
    RETURN 'NC-' || business_date || '-' || lpad(sequence_value::text, 8, '0');
END;
$$;

-- -----------------------------------------------------------------------------
-- 1. 고객사 / 계정 / 권한
-- -----------------------------------------------------------------------------

CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_code varchar(50) NOT NULL,
    name varchar(200) NOT NULL,
    business_registration_number varchar(20),
    logo_file_key varchar(500),
    primary_color varchar(7),
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    approval_policy varchar(30) NOT NULL DEFAULT 'COMPANY',
    shipping_address_policy varchar(30) NOT NULL DEFAULT 'BOTH',
    price_visibility varchar(30) NOT NULL DEFAULT 'HIDDEN',
    default_recipient_name varchar(100),
    default_recipient_phone varchar(30),
    default_postal_code varchar(10),
    default_address_line1 varchar(300),
    default_address_line2 varchar(300),
    contact_name varchar(100),
    contact_email varchar(254),
    contact_phone varchar(30),
    time_zone varchar(50) NOT NULL DEFAULT 'Asia/Seoul',
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT ck_companies_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_companies_approval_policy
        CHECK (approval_policy IN ('NOT_REQUIRED', 'COMPANY', 'DEPARTMENT')),
    CONSTRAINT ck_companies_shipping_address_policy
        CHECK (shipping_address_policy IN ('FIXED', 'USER_INPUT', 'BOTH')),
    CONSTRAINT ck_companies_price_visibility
        CHECK (price_visibility IN ('HIDDEN', 'COMPANY_ADMIN', 'ALL')),
    CONSTRAINT ck_companies_primary_color
        CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT ck_companies_settings_object
        CHECK (jsonb_typeof(settings) = 'object')
);

CREATE UNIQUE INDEX uq_companies_site_code_ci
    ON companies (lower(site_code));
CREATE UNIQUE INDEX uq_companies_business_number
    ON companies (business_registration_number)
    WHERE business_registration_number IS NOT NULL;
CREATE INDEX ix_companies_status ON companies (status) WHERE deleted_at IS NULL;

CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    parent_department_id uuid,
    code varchar(50),
    name varchar(150) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_departments_id_company UNIQUE (id, company_id),
    CONSTRAINT fk_departments_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_departments_parent_same_company
        FOREIGN KEY (parent_department_id, company_id)
        REFERENCES departments (id, company_id),
    CONSTRAINT ck_departments_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_departments_not_self_parent
        CHECK (parent_department_id IS NULL OR parent_department_id <> id)
);

CREATE UNIQUE INDEX uq_departments_company_code_ci
    ON departments (company_id, lower(code))
    WHERE code IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX ix_departments_company_parent
    ON departments (company_id, parent_department_id, sort_order)
    WHERE deleted_at IS NULL;

CREATE TABLE members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid,
    department_id uuid,
    login_id varchar(100) NOT NULL,
    password_hash varchar(255) NOT NULL,
    name varchar(100) NOT NULL,
    english_name varchar(150),
    email varchar(254),
    phone varchar(30),
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    failed_login_count integer NOT NULL DEFAULT 0,
    locked_until timestamptz,
    last_login_at timestamptz,
    password_changed_at timestamptz,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_members_id_company UNIQUE (id, company_id),
    CONSTRAINT fk_members_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_members_department_same_company
        FOREIGN KEY (department_id, company_id)
        REFERENCES departments (id, company_id),
    CONSTRAINT fk_members_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_members_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_members_status
        CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE')),
    CONSTRAINT ck_members_failed_login_count
        CHECK (failed_login_count >= 0)
);

CREATE UNIQUE INDEX uq_members_login_id_ci ON members (lower(login_id));
CREATE INDEX ix_members_company_status
    ON members (company_id, status)
    WHERE deleted_at IS NULL;
CREATE INDEX ix_members_company_department
    ON members (company_id, department_id)
    WHERE deleted_at IS NULL;
CREATE INDEX ix_members_email_ci
    ON members (lower(email))
    WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE roles (
    code varchar(30) PRIMARY KEY,
    name varchar(100) NOT NULL,
    description varchar(500),
    sort_order integer NOT NULL DEFAULT 0,
    is_system boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_roles_code
        CHECK (code ~ '^[A-Z][A-Z0-9_]*$')
);

CREATE TABLE member_roles (
    member_id uuid NOT NULL,
    role_code varchar(30) NOT NULL,
    granted_by uuid,
    granted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id, role_code),
    CONSTRAINT fk_member_roles_member
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_roles_role
        FOREIGN KEY (role_code) REFERENCES roles (code),
    CONSTRAINT fk_member_roles_granted_by
        FOREIGN KEY (granted_by) REFERENCES members (id) ON DELETE SET NULL
);

CREATE INDEX ix_member_roles_role ON member_roles (role_code, member_id);

CREATE TABLE member_company_scopes (
    member_id uuid NOT NULL,
    company_id uuid NOT NULL,
    access_level varchar(20) NOT NULL DEFAULT 'OPERATE',
    granted_by uuid,
    granted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id, company_id),
    CONSTRAINT fk_member_company_scopes_member
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_company_scopes_company
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_company_scopes_granted_by
        FOREIGN KEY (granted_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_member_company_scopes_access_level
        CHECK (access_level IN ('READ', 'OPERATE', 'ADMIN'))
);

CREATE INDEX ix_member_company_scopes_company
    ON member_company_scopes (company_id, access_level);

CREATE TABLE approval_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    member_id uuid NOT NULL,
    department_id uuid,
    approval_scope varchar(20) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_approval_assignments UNIQUE
        (company_id, member_id, department_id, approval_scope),
    CONSTRAINT fk_approval_assignments_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_approval_assignments_member_same_company
        FOREIGN KEY (member_id, company_id) REFERENCES members (id, company_id),
    CONSTRAINT fk_approval_assignments_department_same_company
        FOREIGN KEY (department_id, company_id)
        REFERENCES departments (id, company_id),
    CONSTRAINT fk_approval_assignments_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_approval_assignments_scope
        CHECK (approval_scope IN ('COMPANY', 'DEPARTMENT')),
    CONSTRAINT ck_approval_assignments_department_scope
        CHECK (
            (approval_scope = 'COMPANY' AND department_id IS NULL)
            OR (approval_scope = 'DEPARTMENT' AND department_id IS NOT NULL)
        )
);

CREATE INDEX ix_approval_assignments_lookup
    ON approval_assignments (company_id, department_id, is_active);
CREATE UNIQUE INDEX uq_approval_assignments_company_scope
    ON approval_assignments (company_id, member_id)
    WHERE approval_scope = 'COMPANY';

CREATE TABLE auth_refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL,
    token_hash char(64) NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    issued_ip inet,
    user_agent varchar(500),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_auth_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_refresh_tokens_member
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT ck_auth_refresh_tokens_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX ix_auth_refresh_tokens_member_active
    ON auth_refresh_tokens (member_id, expires_at)
    WHERE revoked_at IS NULL;

CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL,
    token_hash char(64) NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    requested_ip inet,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_password_reset_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_member
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT ck_password_reset_tokens_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX ix_password_reset_tokens_member_active
    ON password_reset_tokens (member_id, expires_at)
    WHERE used_at IS NULL;

CREATE TABLE login_histories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id uuid,
    login_id varchar(100) NOT NULL,
    result varchar(20) NOT NULL,
    failure_reason varchar(100),
    ip_address inet,
    user_agent varchar(500),
    occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_login_histories_member
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_login_histories_result
        CHECK (result IN ('SUCCESS', 'FAILURE', 'LOCKED'))
);

CREATE INDEX ix_login_histories_member_time
    ON login_histories (member_id, occurred_at DESC);
CREATE INDEX ix_login_histories_login_id_time
    ON login_histories (lower(login_id), occurred_at DESC);

-- -----------------------------------------------------------------------------
-- 2. 템플릿 / 상품 / 가격
-- -----------------------------------------------------------------------------

CREATE TABLE materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL,
    name varchar(100) NOT NULL,
    description varchar(500),
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order integer NOT NULL DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT fk_materials_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_materials_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_materials_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE UNIQUE INDEX uq_materials_code_ci ON materials (lower(code));
CREATE INDEX ix_materials_active_sort
    ON materials (sort_order, name) WHERE status = 'ACTIVE' AND deleted_at IS NULL;

CREATE TABLE quantity_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity integer NOT NULL,
    display_name varchar(100) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    sort_order integer NOT NULL DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_quantity_options_quantity UNIQUE (quantity),
    CONSTRAINT fk_quantity_options_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_quantity_options_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_quantity_options_quantity CHECK (quantity > 0),
    CONSTRAINT ck_quantity_options_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(80) NOT NULL,
    name varchar(200) NOT NULL,
    description varchar(1000),
    base_template_id uuid,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT fk_templates_base_template
        FOREIGN KEY (base_template_id) REFERENCES templates (id) ON DELETE SET NULL,
    CONSTRAINT fk_templates_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_templates_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_templates_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_templates_not_self_base
        CHECK (base_template_id IS NULL OR base_template_id <> id)
);

CREATE UNIQUE INDEX uq_templates_code_ci ON templates (lower(code));
CREATE INDEX ix_templates_status_name
    ON templates (status, name) WHERE deleted_at IS NULL;

CREATE TABLE template_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL,
    version_no integer NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'DRAFT',
    change_note varchar(1000),
    width_mm numeric(8,3) NOT NULL DEFAULT 90,
    height_mm numeric(8,3) NOT NULL DEFAULT 50,
    bleed_mm numeric(8,3) NOT NULL DEFAULT 2,
    front_background_file_key varchar(500),
    back_background_file_key varchar(500),
    front_preview_file_key varchar(500),
    back_preview_file_key varchar(500),
    design_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
    published_by uuid,
    published_at timestamptz,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_template_versions_template_version UNIQUE (template_id, version_no),
    CONSTRAINT uq_template_versions_id_template UNIQUE (id, template_id),
    CONSTRAINT fk_template_versions_template
        FOREIGN KEY (template_id) REFERENCES templates (id),
    CONSTRAINT fk_template_versions_published_by
        FOREIGN KEY (published_by) REFERENCES members (id),
    CONSTRAINT fk_template_versions_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_template_versions_version_no CHECK (version_no > 0),
    CONSTRAINT ck_template_versions_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'RETIRED')),
    CONSTRAINT ck_template_versions_dimensions
        CHECK (width_mm > 0 AND height_mm > 0 AND bleed_mm >= 0),
    CONSTRAINT ck_template_versions_design_schema_object
        CHECK (jsonb_typeof(design_schema) = 'object'),
    CONSTRAINT ck_template_versions_published_fields
        CHECK (
            status <> 'PUBLISHED'
            OR (published_at IS NOT NULL AND published_by IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uq_template_versions_one_published
    ON template_versions (template_id)
    WHERE status = 'PUBLISHED';
CREATE INDEX ix_template_versions_template_created
    ON template_versions (template_id, version_no DESC);

CREATE TABLE template_fields (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id uuid NOT NULL,
    field_key varchar(80) NOT NULL,
    label varchar(150) NOT NULL,
    side varchar(10) NOT NULL,
    data_type varchar(20) NOT NULL DEFAULT 'TEXT',
    input_mode varchar(20) NOT NULL DEFAULT 'DIRECT',
    x_mm numeric(10,3) NOT NULL,
    y_mm numeric(10,3) NOT NULL,
    width_mm numeric(10,3) NOT NULL,
    height_mm numeric(10,3) NOT NULL,
    font_family varchar(200),
    font_size_pt numeric(8,3),
    font_weight integer,
    font_color varchar(9),
    text_align varchar(10) NOT NULL DEFAULT 'LEFT',
    line_height numeric(8,3),
    is_required boolean NOT NULL DEFAULT false,
    max_length integer,
    default_value varchar(1000),
    render_order integer NOT NULL DEFAULT 0,
    validation_rule jsonb NOT NULL DEFAULT '{}'::jsonb,
    style_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_template_fields_version_key_side
        UNIQUE (template_version_id, field_key, side),
    CONSTRAINT fk_template_fields_version
        FOREIGN KEY (template_version_id) REFERENCES template_versions (id) ON DELETE CASCADE,
    CONSTRAINT ck_template_fields_side CHECK (side IN ('FRONT', 'BACK')),
    CONSTRAINT ck_template_fields_data_type
        CHECK (data_type IN ('TEXT', 'EMAIL', 'PHONE', 'URL', 'SELECT')),
    CONSTRAINT ck_template_fields_input_mode
        CHECK (input_mode IN ('DIRECT', 'MEMBER', 'COMPANY', 'DEPARTMENT', 'SELECT')),
    CONSTRAINT ck_template_fields_dimensions
        CHECK (x_mm >= 0 AND y_mm >= 0 AND width_mm > 0 AND height_mm > 0),
    CONSTRAINT ck_template_fields_font_size
        CHECK (font_size_pt IS NULL OR font_size_pt > 0),
    CONSTRAINT ck_template_fields_font_weight
        CHECK (font_weight IS NULL OR font_weight BETWEEN 100 AND 900),
    CONSTRAINT ck_template_fields_font_color
        CHECK (font_color IS NULL OR font_color ~ '^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$'),
    CONSTRAINT ck_template_fields_text_align
        CHECK (text_align IN ('LEFT', 'CENTER', 'RIGHT')),
    CONSTRAINT ck_template_fields_max_length
        CHECK (max_length IS NULL OR max_length > 0),
    CONSTRAINT ck_template_fields_validation_rule_object
        CHECK (jsonb_typeof(validation_rule) = 'object'),
    CONSTRAINT ck_template_fields_style_config_object
        CHECK (jsonb_typeof(style_config) = 'object')
);

CREATE INDEX ix_template_fields_version_render
    ON template_fields (template_version_id, side, render_order);

CREATE TABLE company_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    template_id uuid NOT NULL,
    display_name varchar(200),
    is_default boolean NOT NULL DEFAULT false,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    display_order integer NOT NULL DEFAULT 0,
    valid_from date,
    valid_to date,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_company_templates_company_template UNIQUE (company_id, template_id),
    CONSTRAINT uq_company_templates_id_company UNIQUE (id, company_id),
    CONSTRAINT fk_company_templates_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_company_templates_template
        FOREIGN KEY (template_id) REFERENCES templates (id),
    CONSTRAINT fk_company_templates_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_company_templates_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_company_templates_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_company_templates_valid_period
        CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE UNIQUE INDEX uq_company_templates_one_default
    ON company_templates (company_id)
    WHERE is_default = true AND status = 'ACTIVE' AND deleted_at IS NULL;
CREATE INDEX ix_company_templates_available
    ON company_templates (company_id, status, display_order)
    WHERE deleted_at IS NULL;

CREATE TABLE company_template_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    company_template_id uuid NOT NULL,
    material_id uuid NOT NULL,
    quantity_option_id uuid NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    list_price numeric(14,2),
    currency char(3) NOT NULL DEFAULT 'KRW',
    tax_included boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_company_template_options_combination UNIQUE
        (company_template_id, material_id, quantity_option_id),
    CONSTRAINT uq_company_template_options_id_company UNIQUE (id, company_id),
    CONSTRAINT fk_company_template_options_company_template
        FOREIGN KEY (company_template_id, company_id)
        REFERENCES company_templates (id, company_id),
    CONSTRAINT fk_company_template_options_material
        FOREIGN KEY (material_id) REFERENCES materials (id),
    CONSTRAINT fk_company_template_options_quantity
        FOREIGN KEY (quantity_option_id) REFERENCES quantity_options (id),
    CONSTRAINT fk_company_template_options_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_company_template_options_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_company_template_options_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_company_template_options_price
        CHECK (list_price IS NULL OR list_price >= 0),
    CONSTRAINT ck_company_template_options_currency
        CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX ix_company_template_options_available
    ON company_template_options (company_id, company_template_id, status, sort_order)
    WHERE deleted_at IS NULL;

CREATE TABLE price_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_template_option_id uuid NOT NULL,
    policy_name varchar(150) NOT NULL,
    price numeric(14,2) NOT NULL,
    currency char(3) NOT NULL DEFAULT 'KRW',
    tax_included boolean NOT NULL DEFAULT false,
    valid_from date NOT NULL,
    valid_to date,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_price_policies_option
        FOREIGN KEY (company_template_option_id)
        REFERENCES company_template_options (id),
    CONSTRAINT fk_price_policies_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_price_policies_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_price_policies_price CHECK (price >= 0),
    CONSTRAINT ck_price_policies_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_price_policies_period
        CHECK (valid_to IS NULL OR valid_to >= valid_from),
    CONSTRAINT ck_price_policies_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX ix_price_policies_effective
    ON price_policies (company_template_option_id, status, valid_from, valid_to);

-- -----------------------------------------------------------------------------
-- 3. 주문 / 교정 / 승인 / 상태 이력
-- -----------------------------------------------------------------------------

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no varchar(30) NOT NULL DEFAULT generate_order_no(),
    company_id uuid NOT NULL,
    requester_member_id uuid NOT NULL,
    requester_department_id uuid,
    company_template_id uuid NOT NULL,
    company_template_option_id uuid,
    reorder_from_order_id uuid,
    order_type varchar(20) NOT NULL DEFAULT 'NORMAL',
    approval_status varchar(20) NOT NULL DEFAULT 'PENDING',
    production_status varchar(20) NOT NULL DEFAULT 'DRAFT',
    approval_round integer NOT NULL DEFAULT 0,
    idempotency_key varchar(100),
    quantity integer,
    recipient_name varchar(100),
    recipient_phone varchar(30),
    postal_code varchar(10),
    address_line1 varchar(300),
    address_line2 varchar(300),
    customer_memo varchar(1000),
    internal_memo varchar(2000),
    currency char(3) NOT NULL DEFAULT 'KRW',
    unit_price numeric(14,2),
    supply_amount numeric(14,2),
    vat_amount numeric(14,2),
    total_amount numeric(14,2),
    submitted_at timestamptz,
    approved_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason varchar(1000),
    version bigint NOT NULL DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT uq_orders_order_no UNIQUE (order_no),
    CONSTRAINT uq_orders_id_company UNIQUE (id, company_id),
    CONSTRAINT fk_orders_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_orders_requester_same_company
        FOREIGN KEY (requester_member_id, company_id)
        REFERENCES members (id, company_id),
    CONSTRAINT fk_orders_requester_department_same_company
        FOREIGN KEY (requester_department_id, company_id)
        REFERENCES departments (id, company_id),
    CONSTRAINT fk_orders_company_template_same_company
        FOREIGN KEY (company_template_id, company_id)
        REFERENCES company_templates (id, company_id),
    CONSTRAINT fk_orders_option_same_company
        FOREIGN KEY (company_template_option_id, company_id)
        REFERENCES company_template_options (id, company_id),
    CONSTRAINT fk_orders_reorder_source_same_company
        FOREIGN KEY (reorder_from_order_id, company_id)
        REFERENCES orders (id, company_id),
    CONSTRAINT fk_orders_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_orders_order_type
        CHECK (order_type IN ('NORMAL', 'REORDER', 'BULK')),
    CONSTRAINT ck_orders_approval_status
        CHECK (approval_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT ck_orders_production_status
        CHECK (production_status IN ('DRAFT', 'RECEIVED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT ck_orders_approval_round CHECK (approval_round >= 0),
    CONSTRAINT ck_orders_quantity CHECK (quantity IS NULL OR quantity > 0),
    CONSTRAINT ck_orders_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_orders_amounts CHECK (
        (unit_price IS NULL OR unit_price >= 0)
        AND (supply_amount IS NULL OR supply_amount >= 0)
        AND (vat_amount IS NULL OR vat_amount >= 0)
        AND (total_amount IS NULL OR total_amount >= 0)
    ),
    CONSTRAINT ck_orders_cancelled_fields CHECK (
        production_status <> 'CANCELLED'
        OR (cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uq_orders_requester_idempotency
    ON orders (requester_member_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX ix_orders_company_created
    ON orders (company_id, created_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX ix_orders_company_states
    ON orders (company_id, approval_status, production_status, created_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX ix_orders_requester_created
    ON orders (requester_member_id, created_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX ix_orders_approval_queue
    ON orders (company_id, requester_department_id, submitted_at)
    WHERE approval_status = 'PENDING' AND production_status <> 'CANCELLED';
CREATE INDEX ix_orders_production_queue
    ON orders (production_status, approved_at, created_at)
    WHERE production_status IN ('RECEIVED', 'PRINTING');
CREATE INDEX ix_orders_reorder_source
    ON orders (reorder_from_order_id)
    WHERE reorder_from_order_id IS NOT NULL;

CREATE TABLE order_card_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    snapshot_version integer NOT NULL,
    template_id uuid NOT NULL,
    template_version_id uuid NOT NULL,
    template_name varchar(200) NOT NULL,
    template_version_no integer NOT NULL,
    card_data jsonb NOT NULL,
    template_data jsonb NOT NULL,
    product_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    price_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    front_preview_file_key varchar(500),
    back_preview_file_key varchar(500),
    content_hash char(64) NOT NULL,
    is_current boolean NOT NULL DEFAULT true,
    frozen_at timestamptz,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_order_card_snapshots_order_version UNIQUE (order_id, snapshot_version),
    CONSTRAINT uq_order_card_snapshots_id_order UNIQUE (id, order_id),
    CONSTRAINT fk_order_card_snapshots_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_order_card_snapshots_template
        FOREIGN KEY (template_id) REFERENCES templates (id),
    CONSTRAINT fk_order_card_snapshots_template_version
        FOREIGN KEY (template_version_id, template_id)
        REFERENCES template_versions (id, template_id),
    CONSTRAINT fk_order_card_snapshots_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_order_card_snapshots_version CHECK (snapshot_version > 0),
    CONSTRAINT ck_order_card_snapshots_template_version_no CHECK (template_version_no > 0),
    CONSTRAINT ck_order_card_snapshots_card_data_object
        CHECK (jsonb_typeof(card_data) = 'object'),
    CONSTRAINT ck_order_card_snapshots_template_data_object
        CHECK (jsonb_typeof(template_data) = 'object'),
    CONSTRAINT ck_order_card_snapshots_product_data_object
        CHECK (jsonb_typeof(product_data) = 'object'),
    CONSTRAINT ck_order_card_snapshots_price_data_object
        CHECK (jsonb_typeof(price_data) = 'object'),
    CONSTRAINT ck_order_card_snapshots_hash
        CHECK (content_hash ~ '^[0-9a-fA-F]{64}$')
);

CREATE UNIQUE INDEX uq_order_card_snapshots_one_current
    ON order_card_snapshots (order_id)
    WHERE is_current = true;
CREATE INDEX ix_order_card_snapshots_company_order
    ON order_card_snapshots (company_id, order_id, snapshot_version DESC);
CREATE INDEX ix_order_card_snapshots_card_data_gin
    ON order_card_snapshots USING gin (card_data);

CREATE TABLE proof_confirmations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    snapshot_id uuid NOT NULL,
    confirmed_by uuid NOT NULL,
    typo_confirmed boolean NOT NULL,
    contact_confirmed boolean NOT NULL,
    design_confirmed boolean NOT NULL,
    content_hash char(64) NOT NULL,
    confirmed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    invalidated_at timestamptz,
    invalidated_reason varchar(500),
    CONSTRAINT fk_proof_confirmations_snapshot_order
        FOREIGN KEY (snapshot_id, order_id)
        REFERENCES order_card_snapshots (id, order_id),
    CONSTRAINT fk_proof_confirmations_member
        FOREIGN KEY (confirmed_by) REFERENCES members (id),
    CONSTRAINT ck_proof_confirmations_all_checked
        CHECK (typo_confirmed AND contact_confirmed AND design_confirmed),
    CONSTRAINT ck_proof_confirmations_hash
        CHECK (content_hash ~ '^[0-9a-fA-F]{64}$'),
    CONSTRAINT ck_proof_confirmations_invalidation
        CHECK (invalidated_at IS NULL OR invalidated_reason IS NOT NULL)
);

CREATE UNIQUE INDEX uq_proof_confirmations_active_snapshot
    ON proof_confirmations (snapshot_id)
    WHERE invalidated_at IS NULL;
CREATE INDEX ix_proof_confirmations_order_time
    ON proof_confirmations (order_id, confirmed_at DESC);

CREATE TABLE order_approvals (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    approval_round integer NOT NULL,
    action varchar(20) NOT NULL,
    acted_by uuid,
    reason varchar(1000),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_approvals_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_order_approvals_acted_by
        FOREIGN KEY (acted_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_order_approvals_round CHECK (approval_round >= 0),
    CONSTRAINT ck_order_approvals_action
        CHECK (action IN ('SUBMITTED', 'RESUBMITTED', 'APPROVED', 'REJECTED', 'AUTO_APPROVED')),
    CONSTRAINT ck_order_approvals_rejection_reason
        CHECK (action <> 'REJECTED' OR reason IS NOT NULL),
    CONSTRAINT ck_order_approvals_actor
        CHECK (action = 'AUTO_APPROVED' OR acted_by IS NOT NULL)
);

CREATE INDEX ix_order_approvals_order_round
    ON order_approvals (order_id, approval_round, created_at);
CREATE INDEX ix_order_approvals_company_time
    ON order_approvals (company_id, created_at DESC);

CREATE TABLE order_status_histories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    status_type varchar(20) NOT NULL,
    from_status varchar(30),
    to_status varchar(30) NOT NULL,
    changed_by uuid,
    reason varchar(1000),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    changed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_status_histories_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_order_status_histories_changed_by
        FOREIGN KEY (changed_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_order_status_histories_type
        CHECK (status_type IN ('APPROVAL', 'PRODUCTION')),
    CONSTRAINT ck_order_status_histories_status_values CHECK (
        (
            status_type = 'APPROVAL'
            AND (from_status IS NULL OR from_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'))
            AND to_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')
        )
        OR
        (
            status_type = 'PRODUCTION'
            AND (from_status IS NULL OR from_status IN ('DRAFT', 'RECEIVED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
            AND to_status IN ('DRAFT', 'RECEIVED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
        )
    ),
    CONSTRAINT ck_order_status_histories_metadata_object
        CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX ix_order_status_histories_order_time
    ON order_status_histories (order_id, changed_at);
CREATE INDEX ix_order_status_histories_company_time
    ON order_status_histories (company_id, changed_at DESC);

-- -----------------------------------------------------------------------------
-- 4. 제작 / 인쇄 파일 / 배송
-- -----------------------------------------------------------------------------

CREATE TABLE production_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'READY',
    assigned_operator_id uuid,
    production_memo varchar(2000),
    started_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason varchar(1000),
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_production_jobs_order UNIQUE (order_id),
    CONSTRAINT fk_production_jobs_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_production_jobs_operator
        FOREIGN KEY (assigned_operator_id) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_production_jobs_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_production_jobs_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_production_jobs_status
        CHECK (status IN ('READY', 'PRINTING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_production_jobs_times
        CHECK (completed_at IS NULL OR started_at IS NOT NULL),
    CONSTRAINT ck_production_jobs_cancellation
        CHECK (status <> 'CANCELLED' OR (cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL))
);

CREATE INDEX ix_production_jobs_queue
    ON production_jobs (status, created_at);
CREATE INDEX ix_production_jobs_operator
    ON production_jobs (assigned_operator_id, status)
    WHERE assigned_operator_id IS NOT NULL;

CREATE TABLE print_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    snapshot_id uuid NOT NULL,
    file_type varchar(30) NOT NULL,
    version_no integer NOT NULL,
    storage_provider varchar(30) NOT NULL,
    storage_key varchar(1000) NOT NULL,
    original_filename varchar(255) NOT NULL,
    mime_type varchar(100) NOT NULL,
    file_size_bytes bigint,
    sha256 char(64) NOT NULL,
    is_final boolean NOT NULL DEFAULT false,
    is_used_for_print boolean NOT NULL DEFAULT false,
    generation_reason varchar(500),
    generated_by uuid,
    generated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_print_files_order_type_version UNIQUE (order_id, file_type, version_no),
    CONSTRAINT fk_print_files_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_print_files_snapshot_order
        FOREIGN KEY (snapshot_id, order_id)
        REFERENCES order_card_snapshots (id, order_id),
    CONSTRAINT fk_print_files_generated_by
        FOREIGN KEY (generated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_print_files_type
        CHECK (file_type IN ('PREVIEW_FRONT', 'PREVIEW_BACK', 'PRINT_PDF')),
    CONSTRAINT ck_print_files_version CHECK (version_no > 0),
    CONSTRAINT ck_print_files_storage_provider
        CHECK (storage_provider IN ('S3', 'R2', 'RAILWAY_VOLUME', 'OTHER')),
    CONSTRAINT ck_print_files_size
        CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
    CONSTRAINT ck_print_files_sha256
        CHECK (sha256 ~ '^[0-9a-fA-F]{64}$'),
    CONSTRAINT ck_print_files_print_usage
        CHECK (NOT is_used_for_print OR file_type = 'PRINT_PDF')
);

CREATE UNIQUE INDEX uq_print_files_one_used_for_print
    ON print_files (order_id)
    WHERE is_used_for_print = true;
CREATE INDEX ix_print_files_order_created
    ON print_files (order_id, generated_at DESC);
CREATE UNIQUE INDEX uq_print_files_storage_key
    ON print_files (storage_provider, storage_key);

CREATE TABLE print_file_downloads (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    print_file_id uuid NOT NULL,
    downloaded_by uuid,
    ip_address inet,
    user_agent varchar(500),
    downloaded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_print_file_downloads_file
        FOREIGN KEY (print_file_id) REFERENCES print_files (id),
    CONSTRAINT fk_print_file_downloads_member
        FOREIGN KEY (downloaded_by) REFERENCES members (id) ON DELETE SET NULL
);

CREATE INDEX ix_print_file_downloads_file_time
    ON print_file_downloads (print_file_id, downloaded_at DESC);

CREATE TABLE shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    shipment_no integer NOT NULL DEFAULT 1,
    shipping_method varchar(20) NOT NULL DEFAULT 'COURIER',
    carrier_code varchar(50),
    carrier_name varchar(100),
    tracking_number varchar(100),
    tracking_url varchar(1000),
    recipient_name varchar(100) NOT NULL,
    recipient_phone varchar(30) NOT NULL,
    postal_code varchar(10),
    address_line1 varchar(300),
    address_line2 varchar(300),
    status varchar(20) NOT NULL DEFAULT 'PREPARING',
    shipped_at timestamptz,
    delivered_at timestamptz,
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shipments_order_no UNIQUE (order_id, shipment_no),
    CONSTRAINT fk_shipments_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_shipments_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_shipments_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_shipments_no CHECK (shipment_no > 0),
    CONSTRAINT ck_shipments_method
        CHECK (shipping_method IN ('COURIER', 'PICKUP', 'QUICK', 'OTHER')),
    CONSTRAINT ck_shipments_status
        CHECK (status IN ('PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED')),
    CONSTRAINT ck_shipments_tracking_required CHECK (
        status NOT IN ('SHIPPED', 'DELIVERED')
        OR shipping_method <> 'COURIER'
        OR (carrier_name IS NOT NULL AND tracking_number IS NOT NULL)
    ),
    CONSTRAINT ck_shipments_shipped_at CHECK (
        status NOT IN ('SHIPPED', 'DELIVERED') OR shipped_at IS NOT NULL
    ),
    CONSTRAINT ck_shipments_delivered_at CHECK (
        status <> 'DELIVERED' OR delivered_at IS NOT NULL
    )
);

CREATE INDEX ix_shipments_company_status
    ON shipments (company_id, status, created_at DESC);
CREATE INDEX ix_shipments_tracking
    ON shipments (carrier_code, tracking_number)
    WHERE tracking_number IS NOT NULL;

CREATE TABLE shipment_histories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shipment_id uuid NOT NULL,
    action varchar(20) NOT NULL,
    before_data jsonb,
    after_data jsonb,
    changed_by uuid,
    reason varchar(1000),
    changed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment_histories_shipment
        FOREIGN KEY (shipment_id) REFERENCES shipments (id),
    CONSTRAINT fk_shipment_histories_changed_by
        FOREIGN KEY (changed_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_shipment_histories_action
        CHECK (action IN ('CREATED', 'UPDATED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED')),
    CONSTRAINT ck_shipment_histories_before_object
        CHECK (before_data IS NULL OR jsonb_typeof(before_data) = 'object'),
    CONSTRAINT ck_shipment_histories_after_object
        CHECK (after_data IS NULL OR jsonb_typeof(after_data) = 'object')
);

CREATE INDEX ix_shipment_histories_shipment_time
    ON shipment_histories (shipment_id, changed_at);

-- -----------------------------------------------------------------------------
-- 5. 알림 / 감사 로그
-- -----------------------------------------------------------------------------

CREATE TABLE notification_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid,
    event_code varchar(50) NOT NULL,
    channel varchar(20) NOT NULL DEFAULT 'EMAIL',
    name varchar(150) NOT NULL,
    subject_template varchar(500) NOT NULL,
    body_template text NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    created_by uuid,
    updated_by uuid,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamptz,
    CONSTRAINT fk_notification_templates_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_notification_templates_created_by
        FOREIGN KEY (created_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT fk_notification_templates_updated_by
        FOREIGN KEY (updated_by) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_notification_templates_channel
        CHECK (channel IN ('EMAIL')),
    CONSTRAINT ck_notification_templates_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_notification_templates_event_code
        CHECK (event_code ~ '^[A-Z][A-Z0-9_]*$')
);

CREATE UNIQUE INDEX uq_notification_templates_global_event
    ON notification_templates (event_code, channel)
    WHERE company_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX uq_notification_templates_company_event
    ON notification_templates (company_id, event_code, channel)
    WHERE company_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid,
    order_id uuid,
    template_id uuid,
    event_code varchar(50) NOT NULL,
    channel varchar(20) NOT NULL DEFAULT 'EMAIL',
    recipient_member_id uuid,
    recipient_address varchar(320) NOT NULL,
    subject varchar(500),
    body text,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    attempt_count integer NOT NULL DEFAULT 0,
    max_attempts integer NOT NULL DEFAULT 3,
    scheduled_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at timestamptz,
    last_attempt_at timestamptz,
    error_code varchar(100),
    error_message varchar(2000),
    provider_message_id varchar(255),
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_notifications_order_same_company
        FOREIGN KEY (order_id, company_id) REFERENCES orders (id, company_id),
    CONSTRAINT fk_notifications_template
        FOREIGN KEY (template_id) REFERENCES notification_templates (id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_recipient_member
        FOREIGN KEY (recipient_member_id) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_notifications_channel CHECK (channel IN ('EMAIL')),
    CONSTRAINT ck_notifications_status
        CHECK (status IN ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED')),
    CONSTRAINT ck_notifications_attempts
        CHECK (attempt_count >= 0 AND max_attempts > 0 AND attempt_count <= max_attempts),
    CONSTRAINT ck_notifications_payload_object
        CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT ck_notifications_sent_at
        CHECK (status <> 'SENT' OR sent_at IS NOT NULL),
    CONSTRAINT ck_notifications_order_company
        CHECK (order_id IS NULL OR company_id IS NOT NULL)
);

CREATE INDEX ix_notifications_send_queue
    ON notifications (status, scheduled_at)
    WHERE status IN ('PENDING', 'FAILED');
CREATE INDEX ix_notifications_order_time
    ON notifications (order_id, created_at DESC)
    WHERE order_id IS NOT NULL;
CREATE INDEX ix_notifications_recipient_time
    ON notifications (recipient_address, created_at DESC);

CREATE TABLE audit_logs (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id uuid,
    actor_member_id uuid,
    action varchar(100) NOT NULL,
    entity_type varchar(100) NOT NULL,
    entity_id varchar(100),
    before_data jsonb,
    after_data jsonb,
    reason varchar(1000),
    request_id varchar(100),
    ip_address inet,
    user_agent varchar(500),
    occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_company
        FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_member_id) REFERENCES members (id) ON DELETE SET NULL,
    CONSTRAINT ck_audit_logs_before_object
        CHECK (before_data IS NULL OR jsonb_typeof(before_data) = 'object'),
    CONSTRAINT ck_audit_logs_after_object
        CHECK (after_data IS NULL OR jsonb_typeof(after_data) = 'object')
);

CREATE INDEX ix_audit_logs_company_time
    ON audit_logs (company_id, occurred_at DESC);
CREATE INDEX ix_audit_logs_entity
    ON audit_logs (entity_type, entity_id, occurred_at DESC);
CREATE INDEX ix_audit_logs_actor_time
    ON audit_logs (actor_member_id, occurred_at DESC)
    WHERE actor_member_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 6. updated_at 자동 갱신 트리거
-- -----------------------------------------------------------------------------

DO $$
DECLARE
    target_table text;
BEGIN
    FOREACH target_table IN ARRAY ARRAY[
        'companies',
        'departments',
        'members',
        'approval_assignments',
        'materials',
        'quantity_options',
        'templates',
        'company_templates',
        'company_template_options',
        'price_policies',
        'orders',
        'production_jobs',
        'shipments',
        'notification_templates',
        'notifications'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            'trg_' || target_table || '_updated_at',
            target_table
        );
    END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. 테이블 설명
-- -----------------------------------------------------------------------------

COMMENT ON TABLE companies IS '멀티테넌트 고객사와 고객사별 운영 정책';
COMMENT ON TABLE departments IS '고객사별 계층형 부서';
COMMENT ON TABLE members IS '기업 임직원, 기업 관리자, 운영자, 시스템 관리자 계정';
COMMENT ON TABLE member_company_scopes IS '운영자 등 내부 계정의 고객사별 접근 범위';
COMMENT ON TABLE approval_assignments IS '회사 전체 또는 부서 단위 주문 승인자 지정';
COMMENT ON TABLE templates IS '명함 템플릿의 변경되지 않는 기본 식별 정보';
COMMENT ON TABLE template_versions IS '명함 템플릿 디자인 버전';
COMMENT ON TABLE template_fields IS '버전별 편집 필드 위치, 스타일, 검증 규칙';
COMMENT ON TABLE company_templates IS '고객사에서 사용할 수 있는 템플릿 배정';
COMMENT ON TABLE company_template_options IS '고객사 템플릿별 재질·수량 조합';
COMMENT ON TABLE orders IS '주문 헤더, 승인 상태와 제작 상태의 현재값';
COMMENT ON TABLE order_card_snapshots IS '주문 시점의 템플릿·입력문구·상품·가격 불변 스냅샷';
COMMENT ON TABLE proof_confirmations IS '주문자의 교정 확인 및 무효화 이력';
COMMENT ON TABLE order_approvals IS '승인 요청·승인·반려·재상신 이력';
COMMENT ON TABLE order_status_histories IS '승인 상태와 제작 상태 변경 이력';
COMMENT ON TABLE print_files IS '미리보기와 인쇄용 PDF 파일 버전';
COMMENT ON TABLE shipments IS '주문별 배송 및 송장 정보';
COMMENT ON TABLE notifications IS '이메일 발송 큐, 결과, 실패 재시도 이력';
COMMENT ON TABLE audit_logs IS '관리자 변경과 주요 업무 작업에 대한 감사 로그';
