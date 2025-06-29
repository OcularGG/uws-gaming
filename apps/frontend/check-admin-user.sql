-- Check admin user configuration
SELECT id, email, username, "discordId", "isActive", "isApproved", "canCreatePortBattles"
FROM users WHERE email = 'admin@krakengaming.org';
