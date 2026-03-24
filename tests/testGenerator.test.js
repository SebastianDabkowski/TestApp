const { buildPrompt, parseAIResponse } = require('../src/testGenerator');

describe('testGenerator', () => {
  describe('buildPrompt', () => {
    test('builds a prompt from parsed documentation', () => {
      const docContent = {
        title: 'My App',
        sections: [
          { heading: 'My App', level: 1, content: 'An overview.' },
          { heading: 'Login Page', level: 2, content: 'Has email and password fields.' },
        ],
      };

      const prompt = buildPrompt(docContent);

      expect(prompt).toContain('Application: My App');
      expect(prompt).toContain('# My App');
      expect(prompt).toContain('## Login Page');
      expect(prompt).toContain('Has email and password fields.');
    });

    test('uses default title when none provided', () => {
      const docContent = {
        title: '',
        sections: [{ heading: 'Features', level: 2, content: 'Some features.' }],
      };

      const prompt = buildPrompt(docContent);
      expect(prompt).toContain('Application: Web Application');
    });
  });

  describe('parseAIResponse', () => {
    test('parses a valid JSON array response', () => {
      const response = JSON.stringify([
        {
          name: 'Test Login',
          description: 'Verify login works',
          steps: [
            { action: 'navigate', selector: null, value: '/login', expected: null },
            { action: 'type', selector: '#email', value: 'test@test.com', expected: null },
          ],
        },
      ]);

      const result = parseAIResponse(response);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Login');
      expect(result[0].steps).toHaveLength(2);
    });

    test('parses response wrapped in markdown code fences', () => {
      const response = '```json\n[{"name":"Test","description":"desc","steps":[{"action":"navigate","selector":null,"value":"/","expected":null}]}]\n```';

      const result = parseAIResponse(response);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test');
    });

    test('throws on invalid JSON', () => {
      expect(() => parseAIResponse('not json')).toThrow();
    });

    test('throws when response is not an array', () => {
      expect(() => parseAIResponse('{"name": "test"}')).toThrow('not an array');
    });

    test('throws when scenario is missing required fields', () => {
      const response = JSON.stringify([{ description: 'No name field' }]);
      expect(() => parseAIResponse(response)).toThrow('Invalid scenario');
    });
  });
});
