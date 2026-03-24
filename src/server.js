const express = require('express');
const path = require('path');
const { parseMarkdownContent } = require('./docParser');
const { generateTestScenarios } = require('./testGenerator');
const { runTests } = require('./testRunner');
const { buildReportData, buildHtmlReport } = require('./reportGenerator');

/**
 * Simple in-memory rate limiter middleware.
 *
 * @param {{ windowMs: number, maxRequests: number }} options
 * @returns {import('express').RequestHandler}
 */
function rateLimit({ windowMs = 60000, maxRequests = 30 } = {}) {
  const hits = new Map();

  const interval = setInterval(() => hits.clear(), windowMs);
  interval.unref();

  return (req, res, next) => {
    const key = req.ip;
    const count = (hits.get(key) || 0) + 1;
    hits.set(key, count);

    if (count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    return next();
  };
}

/**
 * Creates and configures the Express application.
 *
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 60000, maxRequests: 60 }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.post('/api/parse', (req, res) => {
    const { documentation } = req.body;

    if (!documentation || typeof documentation !== 'string') {
      return res.status(400).json({ error: 'Documentation content is required' });
    }

    try {
      const parsed = parseMarkdownContent(documentation);
      return res.json(parsed);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate', async (req, res) => {
    const { documentation, apiKey } = req.body;

    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    if (!documentation || typeof documentation !== 'string') {
      return res.status(400).json({ error: 'Documentation content is required' });
    }

    try {
      const parsed = parseMarkdownContent(documentation);
      const scenarios = await generateTestScenarios(parsed, key);
      return res.json({ scenarios });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/run', async (req, res) => {
    const { url, documentation, apiKey, options = {} } = req.body;

    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    if (!documentation || typeof documentation !== 'string') {
      return res.status(400).json({ error: 'Documentation content is required' });
    }

    try {
      const parsed = parseMarkdownContent(documentation);
      const scenarios = await generateTestScenarios(parsed, key);
      const timeout = parseInt(options.timeout, 10);
      const results = await runTests(url, scenarios, {
        headed: options.headed || false,
        timeout: (Number.isFinite(timeout) && timeout > 0) ? timeout : 30000,
      });
      const reportData = buildReportData(results, url);
      const htmlReport = buildHtmlReport(reportData);

      return res.json({
        report: reportData,
        htmlReport,
        scenarios,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return app;
}

/**
 * Starts the Express server on the specified port.
 *
 * @param {number} port
 * @returns {import('http').Server}
 */
function startServer(port = 3000) {
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`TestApp server running at http://localhost:${port}`);
  });
  return server;
}

// Start server when run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT, 10) || 3000;
  startServer(port);
}

module.exports = { createApp, startServer };
