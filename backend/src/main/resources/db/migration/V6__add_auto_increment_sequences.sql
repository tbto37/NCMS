-- ========================================================
-- 시드 데이터 조회를 고려한 IDENTITY 시퀀스 값(setval) 동기화 DDL
-- ========================================================

SELECT setval(pg_get_serial_sequence('companies', 'id'), COALESCE((SELECT MAX(id) FROM companies), 1));
SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 1));
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval(pg_get_serial_sequence('members', 'id'), COALESCE((SELECT MAX(id) FROM members), 1));
SELECT setval(pg_get_serial_sequence('templates', 'id'), COALESCE((SELECT MAX(id) FROM templates), 1));
SELECT setval(pg_get_serial_sequence('product_options', 'id'), COALESCE((SELECT MAX(id) FROM product_options), 1));
SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE((SELECT MAX(id) FROM orders), 1));
SELECT setval(pg_get_serial_sequence('order_snapshots', 'id'), COALESCE((SELECT MAX(id) FROM order_snapshots), 1));
SELECT setval(pg_get_serial_sequence('shipments', 'id'), COALESCE((SELECT MAX(id) FROM shipments), 1));
