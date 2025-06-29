-- Update admin password with secure hash
-- Generated on 2025-06-29
-- Email: admin@krakengaming.org
-- Password: OCveiO58PdDm@1A (save this securely!)

UPDATE users
SET password = '$2b$12$u.S3Lc3OVwprpqierNSlA.gYuUKic0zSUsGDTv.T0s/HBTdMKfUKu',
    "updatedAt" = NOW()
WHERE email = 'admin@krakengaming.org';
