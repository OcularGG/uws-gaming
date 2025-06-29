-- Insert admin user with secure password
-- Generated on 2025-06-29
-- Email: admin@krakengaming.org
-- Password: OCveiO58PdDm@1A (save this securely!)

INSERT INTO users (
  id,
  email,
  username,
  password,
  "firstName",
  "lastName",
  "isActive",
  "isApproved",
  "canCreatePortBattles",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-user-id',
  'admin@krakengaming.org',
  'Admiral_Kraken',
  '$2b$12$u.S3Lc3OVwprpqierNSlA.gYuUKic0zSUsGDTv.T0s/HBTdMKfUKu',
  'Admiral',
  'Kraken',
  true,
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
