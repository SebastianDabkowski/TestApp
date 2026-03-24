const fs = require('fs');
const path = require('path');

/**
 * Generates an HTML and JSON test report.
 *
 * @param {Array<{ name: string, description: string, status: string, duration: number, error: string|null, screenshots: string[] }>} results
 * @param {string} outputDir - Directory to save the report
 * @param {string} targetUrl - URL of the tested application
 * @returns {string} Path to the generated HTML report
 */
function generateReport(results, outputDir, targetUrl) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportData = buildReportData(results, targetUrl);

  // Write JSON report
  const jsonPath = path.join(outputDir, `report-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

  // Write HTML report
  const htmlPath = path.join(outputDir, `report-${timestamp}.html`);
  const html = buildHtmlReport(reportData);
  fs.writeFileSync(htmlPath, html);

  return htmlPath;
}

/**
 * Builds structured report data from test results.
 *
 * @param {Array<{ name: string, description: string, status: string, duration: number, error: string|null, screenshots: string[] }>} results
 * @param {string} targetUrl
 * @returns {{ summary: object, tests: Array, generatedAt: string, targetUrl: string }}
 */
function buildReportData(results, targetUrl) {
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  return {
    generatedAt: new Date().toISOString(),
    targetUrl,
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      duration: totalDuration,
      passRate: results.length > 0 ? ((passed / results.length) * 100).toFixed(1) : '0.0',
    },
    tests: results,
  };
}

/**
 * Builds an HTML report string from report data.
 *
 * @param {{ summary: object, tests: Array, generatedAt: string, targetUrl: string }} data
 * @returns {string}
 */
function buildHtmlReport(data) {
  const testRows = data.tests
    .map(
      (test) => `
    <tr class="${test.status}">
      <td>${escapeHtml(test.name)}</td>
      <td>${escapeHtml(test.description)}</td>
      <td><span class="badge badge-${test.status}">${test.status}</span></td>
      <td>${test.duration}ms</td>
      <td>${test.error ? escapeHtml(test.error) : '-'}</td>
    </tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TestApp Report - ${escapeHtml(data.targetUrl)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
    .summary-card h2 { margin: 0; font-size: 2em; }
    .summary-card p { margin: 5px 0 0; color: #666; }
    .summary-card.passed h2 { color: #22c55e; }
    .summary-card.failed h2 { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #333; color: white; }
    tr.passed { background: #f0fdf4; }
    tr.failed { background: #fef2f2; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
    .badge-passed { background: #dcfce7; color: #166534; }
    .badge-failed { background: #fee2e2; color: #991b1b; }
    .badge-skipped { background: #fef3c7; color: #92400e; }
    .meta { color: #666; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TestApp Report</h1>
    <p class="meta">Target: ${escapeHtml(data.targetUrl)} | Generated: ${data.generatedAt}</p>

    <div class="summary">
      <div class="summary-card">
        <h2>${data.summary.total}</h2>
        <p>Total Tests</p>
      </div>
      <div class="summary-card passed">
        <h2>${data.summary.passed}</h2>
        <p>Passed</p>
      </div>
      <div class="summary-card failed">
        <h2>${data.summary.failed}</h2>
        <p>Failed</p>
      </div>
      <div class="summary-card">
        <h2>${data.summary.passRate}%</h2>
        <p>Pass Rate</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Description</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        ${testRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

module.exports = { generateReport, buildReportData, buildHtmlReport, escapeHtml };
