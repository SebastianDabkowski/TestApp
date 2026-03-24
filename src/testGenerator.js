const OpenAI = require('openai');

/**
 * Generates test scenarios from parsed documentation using OpenAI.
 *
 * @param {{ title: string, sections: Array<{ heading: string, level: number, content: string }> }} docContent
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Array<{ name: string, description: string, steps: Array<{ action: string, selector: string|null, value: string|null, expected: string|null }> }>>}
 */
async function generateTestScenarios(docContent, apiKey) {
  const client = new OpenAI({ apiKey });

  const prompt = buildPrompt(docContent);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a QA engineer. Given application documentation, generate structured test scenarios.
Return a JSON array of test scenarios. Each scenario has:
- "name": short test name
- "description": what the test verifies
- "steps": array of step objects with:
  - "action": one of "navigate", "click", "type", "select", "wait", "assert_visible", "assert_text", "assert_url", "screenshot"
  - "selector": CSS selector or null for navigate/wait/screenshot
  - "value": input value, URL path, wait time, or expected text
  - "expected": expected result description or null

Return ONLY the JSON array, no other text.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content.trim();
  return parseAIResponse(content);
}

/**
 * Builds a prompt string from parsed documentation.
 *
 * @param {{ title: string, sections: Array<{ heading: string, level: number, content: string }> }} docContent
 * @returns {string}
 */
function buildPrompt(docContent) {
  let prompt = `Application: ${docContent.title || 'Web Application'}\n\nDocumentation:\n`;

  for (const section of docContent.sections) {
    prompt += `\n${'#'.repeat(section.level)} ${section.heading}\n`;
    if (section.content) {
      prompt += `${section.content}\n`;
    }
  }

  prompt += '\nGenerate comprehensive test scenarios based on this documentation.';
  return prompt;
}

/**
 * Parses the AI response into test scenarios.
 *
 * @param {string} content - Raw AI response content
 * @returns {Array<{ name: string, description: string, steps: Array<{ action: string, selector: string|null, value: string|null, expected: string|null }> }>}
 */
function parseAIResponse(content) {
  // Remove markdown code fences if present
  let cleaned = content;
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  const scenarios = JSON.parse(cleaned.trim());

  if (!Array.isArray(scenarios)) {
    throw new Error('AI response is not an array of test scenarios');
  }

  // Validate structure
  for (const scenario of scenarios) {
    if (!scenario.name || !Array.isArray(scenario.steps)) {
      throw new Error(`Invalid scenario structure: ${JSON.stringify(scenario)}`);
    }
  }

  return scenarios;
}

module.exports = { generateTestScenarios, buildPrompt, parseAIResponse };
