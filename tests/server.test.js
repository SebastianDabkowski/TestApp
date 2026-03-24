const { createApp } = require('../src/server');
const http = require('http');

let app;
let server;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: server.address().port,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

beforeAll((done) => {
  app = createApp();
  server = app.listen(0, done);
});

afterAll((done) => {
  server.close(done);
});

describe('server', () => {
  describe('GET /', () => {
    test('serves the HTML page', async () => {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${server.address().port}/`, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
      });

      expect(res.status).toBe(200);
      expect(res.body).toContain('<!DOCTYPE html>');
      expect(res.body).toContain('TestApp');
    });
  });

  describe('POST /api/parse', () => {
    test('parses markdown documentation', async () => {
      const res = await request('POST', '/api/parse', {
        documentation: '# My App\n\nOverview text.\n\n## Features\n\nFeature list.',
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('My App');
      expect(res.body.sections).toHaveLength(2);
      expect(res.body.sections[0].heading).toBe('My App');
      expect(res.body.sections[1].heading).toBe('Features');
    });

    test('returns 400 when documentation is missing', async () => {
      const res = await request('POST', '/api/parse', {});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Documentation content is required');
    });

    test('returns 400 when documentation is not a string', async () => {
      const res = await request('POST', '/api/parse', { documentation: 123 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Documentation content is required');
    });

    test('handles empty markdown content', async () => {
      const res = await request('POST', '/api/parse', { documentation: 'Just text, no headings' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('');
      expect(res.body.sections).toEqual([]);
    });
  });

  describe('POST /api/generate', () => {
    test('returns 400 when API key is missing', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        const res = await request('POST', '/api/generate', {
          documentation: '# App\n\n## Page\n\nSome content.',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('API key is required');
      } finally {
        if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
      }
    });

    test('returns 400 when documentation is missing', async () => {
      const res = await request('POST', '/api/generate', {
        apiKey: 'test-key',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Documentation content is required');
    });
  });

  describe('POST /api/run', () => {
    test('returns 400 when URL is missing', async () => {
      const res = await request('POST', '/api/run', {
        documentation: '# App',
        apiKey: 'test-key',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Target URL is required');
    });

    test('returns 400 when documentation is missing', async () => {
      const res = await request('POST', '/api/run', {
        url: 'https://example.com',
        apiKey: 'test-key',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Documentation content is required');
    });

    test('returns 400 when API key is missing', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        const res = await request('POST', '/api/run', {
          url: 'https://example.com',
          documentation: '# App',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('API key is required');
      } finally {
        if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
      }
    });
  });
});
