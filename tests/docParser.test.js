const { parseMarkdownContent } = require('../src/docParser');

describe('docParser', () => {
  describe('parseMarkdownContent', () => {
    test('parses a simple markdown document with title and sections', () => {
      const markdown = `# My App

This is the overview.

## Features

Feature list here.

## Login Page

- URL: /login
- Has email and password fields
`;

      const result = parseMarkdownContent(markdown);

      expect(result.title).toBe('My App');
      expect(result.sections).toHaveLength(3);
      expect(result.sections[0]).toEqual({
        heading: 'My App',
        level: 1,
        content: 'This is the overview.',
      });
      expect(result.sections[1]).toEqual({
        heading: 'Features',
        level: 2,
        content: 'Feature list here.',
      });
      expect(result.sections[2]).toEqual({
        heading: 'Login Page',
        level: 2,
        content: '- URL: /login\n- Has email and password fields',
      });
    });

    test('handles empty content', () => {
      const result = parseMarkdownContent('');
      expect(result.title).toBe('');
      expect(result.sections).toEqual([]);
    });

    test('handles content with no headings', () => {
      const result = parseMarkdownContent('Just some text without headings.');
      expect(result.title).toBe('');
      expect(result.sections).toEqual([]);
    });

    test('handles nested heading levels', () => {
      const markdown = `# Title

## Section

### Subsection

Details here.
`;

      const result = parseMarkdownContent(markdown);
      expect(result.sections).toHaveLength(3);
      expect(result.sections[0].level).toBe(1);
      expect(result.sections[1].level).toBe(2);
      expect(result.sections[2].level).toBe(3);
      expect(result.sections[2].content).toBe('Details here.');
    });
  });
});
