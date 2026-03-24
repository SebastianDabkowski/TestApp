const { buildReportData, buildHtmlReport, escapeHtml } = require('../src/reportGenerator');

describe('reportGenerator', () => {
  const sampleResults = [
    {
      name: 'Test Home Page',
      description: 'Verify home page loads',
      status: 'passed',
      duration: 1200,
      error: null,
      screenshots: [],
    },
    {
      name: 'Test Login',
      description: 'Verify login flow',
      status: 'failed',
      duration: 3400,
      error: 'Element not found: #login-btn',
      screenshots: ['screenshot-1.png'],
    },
    {
      name: 'Test Search',
      description: 'Verify search functionality',
      status: 'skipped',
      duration: 0,
      error: null,
      screenshots: [],
    },
  ];

  describe('buildReportData', () => {
    test('creates correct summary statistics', () => {
      const data = buildReportData(sampleResults, 'https://example.com');

      expect(data.targetUrl).toBe('https://example.com');
      expect(data.summary.total).toBe(3);
      expect(data.summary.passed).toBe(1);
      expect(data.summary.failed).toBe(1);
      expect(data.summary.skipped).toBe(1);
      expect(data.summary.duration).toBe(4600);
      expect(data.summary.passRate).toBe('33.3');
    });

    test('handles empty results', () => {
      const data = buildReportData([], 'https://example.com');

      expect(data.summary.total).toBe(0);
      expect(data.summary.passed).toBe(0);
      expect(data.summary.passRate).toBe('0.0');
    });

    test('includes generatedAt timestamp', () => {
      const data = buildReportData(sampleResults, 'https://example.com');
      expect(data.generatedAt).toBeDefined();
      expect(new Date(data.generatedAt).getTime()).not.toBeNaN();
    });
  });

  describe('buildHtmlReport', () => {
    test('generates valid HTML with test results', () => {
      const data = buildReportData(sampleResults, 'https://example.com');
      const html = buildHtmlReport(data);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('TestApp Report');
      expect(html).toContain('https://example.com');
      expect(html).toContain('Test Home Page');
      expect(html).toContain('Test Login');
      expect(html).toContain('badge-passed');
      expect(html).toContain('badge-failed');
    });
  });

  describe('escapeHtml', () => {
    test('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    test('escapes ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    test('handles strings without special characters', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });

    test('handles non-string input', () => {
      expect(escapeHtml(123)).toBe('123');
    });
  });
});
