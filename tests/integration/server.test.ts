// SPDX-License-Identifier: BSD-3-Clause
import request from 'supertest';
import { Application } from 'express';

describe('Server Endpoints', () => {
  beforeAll(() => {
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_PRIVATE_KEY = 'dummy';
    process.env.WEBHOOK_SECRET = 'dummy';
    process.env.ENCRYPTION_KEY = 'dummy-encryption-key';
    process.env.ENCRYPTION_SALT = 'dummy-salt';
    process.env.API_SECRET = 'dummy-api-secret';
  });

  let app: Application;
  beforeAll(async () => {
    app = (await import('../../ux/github-app/server')).default;
  });
  it('should return 200 for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Organic Typing GitHub App');
  });

  it('should return 204 for GET /favicon.ico', async () => {
    const response = await request(app).get('/favicon.ico');
    expect(response.status).toBe(204);
  });

  it('should return 204 for GET /favicon.png', async () => {
    const response = await request(app).get('/favicon.png');
    expect(response.status).toBe(204);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
});