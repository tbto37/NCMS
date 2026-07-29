-- ========================================================
-- members 및 orders 테이블 VARCHAR id 숫자로만 자동 채번(Auto Increment) 시퀀스 DDL
-- ========================================================

-- 1. members 테이블 시퀀스 생성 및 DEFAULT 설정 ('1', '2', '3' ... 숫자로만 채번)
CREATE SEQUENCE IF NOT EXISTS members_id_seq START WITH 10;
ALTER TABLE members ALTER COLUMN id SET DEFAULT nextval('members_id_seq')::text;

-- 2. orders 테이블 시퀀스 생성 및 DEFAULT 설정 ('1', '2', '3' ... 숫자로만 채번)
CREATE SEQUENCE IF NOT EXISTS orders_id_seq START WITH 10;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval('orders_id_seq')::text;

-- 3. order_snapshots 테이블 시퀀스 생성 및 DEFAULT 설정 ('1', '2', '3' ... 숫자로만 채번)
CREATE SEQUENCE IF NOT EXISTS order_snapshots_id_seq START WITH 10;
ALTER TABLE order_snapshots ALTER COLUMN id SET DEFAULT nextval('order_snapshots_id_seq')::text;
