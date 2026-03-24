const fs = require('fs');

/**
 * Parses a markdown documentation file into structured sections.
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {{ title: string, sections: Array<{ heading: string, level: number, content: string }> }}
 */
function parseDocumentation(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseMarkdownContent(content);
}

/**
 * Parses raw markdown content into structured sections.
 *
 * @param {string} content - Raw markdown text
 * @returns {{ title: string, sections: Array<{ heading: string, level: number, content: string }> }}
 */
function parseMarkdownContent(content) {
  const lines = content.split('\n');
  const sections = [];
  let title = '';
  let currentSection = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }

      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();

      if (level === 1 && !title) {
        title = heading;
      }

      currentSection = {
        heading,
        level,
        content: '',
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  // Push the last section
  if (currentSection) {
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }

  return { title, sections };
}

module.exports = { parseDocumentation, parseMarkdownContent };
