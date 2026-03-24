#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { parseDocumentation } = require('./docParser');
const { generateTestScenarios } = require('./testGenerator');
const { runTests } = require('./testRunner');
const { generateReport } = require('./reportGenerator');

const program = new Command();

program
  .name('testapp')
  .description('AI-powered web application testing tool using Playwright')
  .version('1.0.0');

program
  .requiredOption('-u, --url <url>', 'URL of the application to test')
  .requiredOption('-d, --docs <path>', 'Path to the documentation markdown file')
  .option('-o, --output <path>', 'Output directory for the test report', './reports')
  .option('-k, --api-key <key>', 'OpenAI API key (or set OPENAI_API_KEY env variable)')
  .option('--headed', 'Run browser in headed mode', false)
  .option('--timeout <ms>', 'Test timeout in milliseconds', '30000');

program.parse(process.argv);

async function main() {
  const options = program.opts();

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OpenAI API key is required. Use --api-key or set OPENAI_API_KEY environment variable.');
    process.exit(1);
  }

  const docsPath = path.resolve(options.docs);
  if (!fs.existsSync(docsPath)) {
    console.error(`Error: Documentation file not found: ${docsPath}`);
    process.exit(1);
  }

  const outputDir = path.resolve(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('=== TestApp - AI-Powered Web Application Tester ===\n');
  console.log(`Target URL: ${options.url}`);
  console.log(`Documentation: ${docsPath}`);
  console.log(`Output: ${outputDir}\n`);

  try {
    // Step 1: Parse the documentation
    console.log('Step 1: Parsing documentation...');
    const docContent = parseDocumentation(docsPath);
    console.log(`  Parsed ${docContent.sections.length} sections from documentation.\n`);

    // Step 2: Generate test scenarios using AI
    console.log('Step 2: Generating test scenarios with AI...');
    const testScenarios = await generateTestScenarios(docContent, apiKey);
    console.log(`  Generated ${testScenarios.length} test scenarios.\n`);

    // Step 3: Run Playwright tests
    console.log('Step 3: Running Playwright tests...');
    const testResults = await runTests(options.url, testScenarios, {
      headed: options.headed,
      timeout: parseInt(options.timeout, 10),
    });
    console.log(`  Completed ${testResults.length} tests.\n`);

    // Step 4: Generate report
    console.log('Step 4: Generating report...');
    const reportPath = generateReport(testResults, outputDir, options.url);
    console.log(`  Report generated: ${reportPath}\n`);

    // Summary
    const passed = testResults.filter((r) => r.status === 'passed').length;
    const failed = testResults.filter((r) => r.status === 'failed').length;
    const skipped = testResults.filter((r) => r.status === 'skipped').length;

    console.log('=== Test Summary ===');
    console.log(`  Total:   ${testResults.length}`);
    console.log(`  Passed:  ${passed}`);
    console.log(`  Failed:  ${failed}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`\nReport: ${reportPath}`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
