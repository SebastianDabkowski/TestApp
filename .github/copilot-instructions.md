# GitHub Copilot Instructions for TestApp

## Project Overview

TestApp is an AI-powered web application testing tool. It accepts a target URL and a markdown documentation file, uses OpenAI to generate Playwright test scenarios, executes them in a real browser, and produces HTML/JSON reports.

## Architecture

The application is organized into four core modules:

- **`src/docParser.js`** — Parses a markdown documentation file into sections and structured content for the AI.
- **`src/testGenerator.js`** — Sends parsed documentation to OpenAI and returns structured test scenarios (arrays of steps with Playwright actions).
- **`src/testRunner.js`** — Iterates over test scenarios and executes each step using Playwright.
- **`src/reportGenerator.js`** — Takes test results and writes an HTML report and a JSON report to the output directory.
- **`src/index.js`** — CLI entry point that wires the four modules together.

## How to Use Copilot with This Project

### Writing Documentation Files

The most effective way to use Copilot here is to generate or improve the markdown documentation files that TestApp uses as input. Ask Copilot to:

1. **Generate a documentation file** for a web application you want to test:
   > "Write a TestApp documentation file for a todo-list web app that has login, creating tasks, editing tasks, and deleting tasks."

2. **Expand an existing documentation file** with more detail:
   > "Add an 'Expected Behaviors' section to this documentation file describing form validation rules."

3. **Add specific UI element details** to improve test accuracy:
   > "Add CSS selectors and button text to the 'UI Elements' section so TestApp can generate more precise tests."

### Documentation File Format

Ask Copilot to follow this structure when generating docs files:

```markdown
# Application Name

Brief description of the application.

## Pages

### Page Name
- URL: `/path`
- Description of page content and purpose
- Key UI elements visible on this page

## Features

### Feature Name
1. Step-by-step user flow description
2. Each step maps to a Playwright browser action
3. Include expected outcomes after each step

## UI Elements

### Element Name
- CSS selector or ARIA label when known
- Expected text or state
- Behavior on interaction

## Expected Behaviors

### Validation Rules
- List form validation constraints
- Describe error messages and when they appear
```

### Extending the Codebase

When adding features to TestApp, use these patterns:

- **New CLI options**: Add to `src/index.js` using `program.option()` from the `commander` package.
- **Parsing improvements**: Modify `src/docParser.js` — the `parseDocumentation(filePath)` function returns `{ sections, raw }`.
- **AI prompt changes**: Modify `src/testGenerator.js` — the `generateTestScenarios(docContent, apiKey)` function builds the OpenAI prompt.
- **New Playwright actions**: Modify `src/testRunner.js` — the `runTests(url, scenarios, options)` function maps scenario steps to Playwright calls.
- **Report customization**: Modify `src/reportGenerator.js` — the `generateReport(results, outputDir, url)` function writes HTML and JSON.

### Running and Testing

```bash
# Install dependencies
npm install

# Run the CLI
npm start -- --url https://example.com --docs ./examples/sample-app-docs.md

# Run unit tests
npm test
```

### Asking Copilot for Help

Examples of effective prompts when working on this codebase:

- "Add a `--max-scenarios` CLI option to limit the number of test scenarios generated."
- "Update `testGenerator.js` to retry the OpenAI call once on rate-limit errors."
- "Add a `screenshot` action type to `testRunner.js` that saves a screenshot to the output directory."
- "Generate a documentation file for a shopping cart application with product listing, cart management, and checkout."
- "Write a unit test for `docParser.js` that verifies a multi-section markdown file is parsed into the correct number of sections."
