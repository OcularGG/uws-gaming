// Backend-specific test setup
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret';
process.env.API_PORT = '0'; // Use random available port
process.env.SENTRY_DSN = ''; // Disable Sentry in tests
