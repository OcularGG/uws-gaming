import request from 'supertest';
import { build } from '../index';

describe('Health API', () => {
  let app: Awaited<ReturnType<typeof build>>;

  beforeAll(async () => {
    app = await build({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status', async () => {
    const response = await request(app.server)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return liveness status', async () => {
    const response = await request(app.server)
      .get('/api/v1/health/live')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'alive');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return readiness status', async () => {
    const response = await request(app.server)
      .get('/api/v1/health/ready')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ready');
    expect(response.body).toHaveProperty('timestamp');
  });
});
