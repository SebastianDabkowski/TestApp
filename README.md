# TestApp

AI-powered web application testing tool that uses Playwright to automatically test any web application based on a URL and documentation.

## Overview

TestApp takes a **target URL** and a **markdown documentation file** describing the application, then uses AI (OpenAI) to generate test scenarios and executes them automatically with [Playwright](https://playwright.dev/). After running all tests, it produces a detailed HTML and JSON report.

### How It Works

1. **Provide inputs** — Supply the URL of the application to test and a markdown file describing its features and behavior.
2. **AI generates tests** — OpenAI analyzes the documentation and creates structured test scenarios with step-by-step browser actions.
3. **Playwright executes tests** — Each scenario is run against the target URL in a real browser using Playwright.
4. **Report is generated** — Results are compiled into an HTML report with pass/fail status, durations, and error details.

## Installation

```bash
# Clone the repository
git clone https://github.com/SebastianDabkowski/TestApp.git
cd TestApp

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Prerequisites

- **Node.js** >= 18.0.0
- **OpenAI API key** — Set as environment variable or pass via CLI flag

## Quick Start

### Web Interface

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Start the web server
npm run serve
```

Open **http://localhost:3000** in your browser. The web UI lets you:
- Enter a target URL and paste documentation
- Parse documentation to preview detected sections
- Run the full test pipeline and view results with pass/fail status

### CLI

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Run TestApp against a target application
npm start -- --url https://example.com --docs ./examples/sample-app-docs.md
```

## Usage

```bash
testapp --url <target-url> --docs <path-to-docs.md> [options]
```

### Required Options

| Option | Description |
|--------|-------------|
| `-u, --url <url>` | URL of the web application to test |
| `-d, --docs <path>` | Path to the markdown documentation file |

### Optional Flags

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output directory for reports | `./reports` |
| `-k, --api-key <key>` | OpenAI API key | `OPENAI_API_KEY` env var |
| `--headed` | Run browser in visible mode | `false` |
| `--timeout <ms>` | Test timeout in milliseconds | `30000` |

### Examples

```bash
# Basic usage
npm start -- --url https://myapp.com --docs ./docs/app-documentation.md

# Custom output directory and headed mode
npm start -- --url https://myapp.com --docs ./docs/app-documentation.md --output ./my-reports --headed

# With inline API key
npm start -- --url https://myapp.com --docs ./docs/app-documentation.md --api-key sk-...
```

## Documentation File Format

The documentation file should be a markdown file describing the application's features, pages, and expected behavior. See [docs/DOCUMENTATION_GUIDE.md](docs/DOCUMENTATION_GUIDE.md) for the recommended format and an [example documentation file](examples/sample-app-docs.md).

## Reports

TestApp generates two report files in the output directory:

- **HTML Report** — Visual report with summary cards, pass rates, and a detailed test results table.
- **JSON Report** — Machine-readable report with full test data for CI/CD integration.

## Project Structure

```
TestApp/
├── src/
│   ├── index.js            # CLI entry point
│   ├── server.js           # Express web server
│   ├── public/
│   │   └── index.html      # Web UI frontend
│   ├── docParser.js         # Markdown documentation parser
│   ├── testGenerator.js     # AI-powered test scenario generator
│   ├── testRunner.js        # Playwright test executor
│   └── reportGenerator.js   # HTML and JSON report generator
├── tests/                   # Unit tests
├── docs/                    # Project documentation
├── examples/                # Example documentation files
├── playwright.config.js     # Playwright configuration
└── package.json
```

## Running Tests

```bash
npm test
```

## License

MIT

