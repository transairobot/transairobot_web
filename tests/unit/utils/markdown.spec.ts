import { describe, it, expect } from 'vitest';
import { markdownToHtml, sanitizeHtml, renderMarkdown } from '@/utils/markdown';

describe('Markdown Utilities', () => {
  describe('markdownToHtml', () => {
    it('converts headers', () => {
      expect(markdownToHtml('# Heading 1')).toContain('<h1>Heading 1</h1>');
      expect(markdownToHtml('## Heading 2')).toContain('<h2>Heading 2</h2>');
      expect(markdownToHtml('### Heading 3')).toContain('<h3>Heading 3</h3>');
    });

    it('converts bold text', () => {
      expect(markdownToHtml('This is **bold** text')).toContain(
        'This is <strong>bold</strong> text'
      );
    });

    it('converts italic text', () => {
      expect(markdownToHtml('This is *italic* text')).toContain('This is <em>italic</em> text');
    });

    it('converts links', () => {
      expect(markdownToHtml('[Link text](https://example.com)')).toContain(
        '<a href="https://example.com">Link text</a>'
      );
    });

    it('converts lists', () => {
      const markdown = '* Item 1\n* Item 2';
      const html = markdownToHtml(markdown);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    it('wraps plain text in paragraphs', () => {
      expect(markdownToHtml('Plain text')).toContain('<p>Plain text</p>');
    });

    it('handles complex markdown', () => {
      const markdown = `# Title
      
This is a paragraph with **bold** and *italic* text.

## Subheading

* List item 1
* List item 2

[Link](https://example.com)`;

      const html = markdownToHtml(markdown);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain(
        '<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>'
      );
      expect(html).toContain('<h2>Subheading</h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>List item 1</li>');
      expect(html).toContain('<li>List item 2</li>');
      expect(html).toContain('</ul>');
      expect(html).toContain('<a href="https://example.com">Link</a>');
    });

    it('returns empty string for null or undefined', () => {
      expect(markdownToHtml(null)).toBe('');
      expect(markdownToHtml(undefined)).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('returns the input HTML (placeholder implementation)', () => {
      const html = '<p>Test</p>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    // Note: In a real implementation, we would test that script tags and other
    // potentially dangerous content is properly sanitized
  });

  describe('renderMarkdown', () => {
    it('converts markdown to HTML and sanitizes it', () => {
      const markdown = '# Title\n\nThis is **bold**.';
      const result = renderMarkdown(markdown);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>This is <strong>bold</strong>.</p>');
    });
  });
});
