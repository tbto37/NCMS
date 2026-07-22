-- NCMS H2 Initial Schema
-- Simplified version for development

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    name VARCHAR(200) NOT NULL,
    site_code VARCHAR(50) UNIQUE,
    logo_file_key VARCHAR(500),
    primary_color VARCHAR(7),
    approval_policy VARCHAR(20) NOT NULL DEFAULT 'REQUIRED',
    shipping_address_policy VARCHAR(20) NOT NULL DEFAULT 'BOTH',
    price_visibility VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    default_shipping_recipient VARCHAR(100),
    default_shipping_phone VARCHAR(20),
    default_shipping_postal_code VARCHAR(10),
    default_shipping_address VARCHAR(500),
    default_shipping_address_detail VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    company_id UUID NOT NULL,
    parent_department_id UUID,
    name VARCHAR(100) NOT NULL,
    full_path VARCHAR(500),
    sort_order INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    company_id UUID,
    department_id UUID,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    korean_name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    office_phone VARCHAR(20),
    position VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_password_changed_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE member_roles (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    member_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(member_id, role_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    company_id UUID NOT NULL,
    requester_member_id UUID NOT NULL,
    requester_department_id UUID,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    idempotency_key VARCHAR(100),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    production_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    shipping_recipient VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_postal_code VARCHAR(10),
    shipping_address VARCHAR(500),
    shipping_address_detail VARCHAR(500),
    order_memo CLOB,
    total_amount DECIMAL(12, 2),
    tax_amount DECIMAL(12, 2),
    grand_total DECIMAL(12, 2),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (requester_member_id) REFERENCES members(id),
    FOREIGN KEY (requester_department_id) REFERENCES departments(id)
);

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_members_company_id ON members(company_id);
CREATE INDEX idx_orders_company_id ON orders(company_id, created_at DESC);
CREATE INDEX idx_orders_requester_member_id ON orders(requester_member_id, created_at DESC);
