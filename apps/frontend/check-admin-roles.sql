-- Check admin user roles
SELECT ur.*, u.email, r.name
FROM user_roles ur
JOIN users u ON ur."userId" = u.id
JOIN roles r ON ur."roleId" = r.id
WHERE u.email = 'admin@krakengaming.org';
