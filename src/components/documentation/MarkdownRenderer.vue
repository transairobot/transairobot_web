<template>
  <div class="markdown-content" v-html="sanitizedContent"></div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { renderMathInElement } from 'katex';
import 'katex/dist/katex.min.css';

export default defineComponent({
  name: 'MarkdownRenderer',

  props: {
    /**
     * Markdown content to render
     */
    content: {
      type: String,
      required: true
    },

    /**
     * Whether to render math formulas
     */
    renderMath: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    // Configure marked with highlight.js for syntax highlighting
    marked.setOptions({
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
      headerIds: true,
      headerPrefix: 'markdown-header-',
      langPrefix: 'language-'
    });

    // Render and sanitize markdown content
    const sanitizedContent = computed(() => {
      try {
        // Render markdown to HTML
        const html = marked(props.content || '');

        // Sanitize HTML to prevent XSS attacks
        return DOMPurify.sanitize(html, {
          ADD_ATTR: ['target'],
          ADD_TAGS: ['iframe', 'math', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'mfrac']
        });
      } catch (error) {
        console.error('Error rendering markdown:', error);
        return '<p>Error rendering content</p>';
      }
    });

    return {
      sanitizedContent
    };
  },

  mounted() {
    // Render math formulas if enabled
    if (this.renderMath) {
      this.$nextTick(() => {
        try {
          renderMathInElement(this.$el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        } catch (error) {
          console.error('Error rendering math:', error);
        }
      });
    }

    // Add target="_blank" to external links
    this.$nextTick(() => {
      const links = this.$el.querySelectorAll('a');
      links.forEach(link => {
        if (link.hostname !== window.location.hostname) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    });
  }
});
</script>

<style lang="scss">
.markdown-content {
  line-height: 1.6;
  color: var(--color-text);

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.25em;
  }

  h4 {
    font-size: 1em;
  }

  p {
    margin-top: 0;
    margin-bottom: 1em;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em 0;
  }

  pre {
    background-color: var(--color-surface);
    border-radius: var(--border-radius-md);
    padding: 1em;
    overflow: auto;
    margin: 1em 0;

    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }
  }

  code {
    background-color: var(--color-surface);
    border-radius: var(--border-radius-sm);
    padding: 0.2em 0.4em;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
  }

  blockquote {
    margin: 1em 0;
    padding: 0 1em;
    color: var(--color-text-secondary);
    border-left: 0.25em solid var(--color-border);

    > :first-child {
      margin-top: 0;
    }

    > :last-child {
      margin-bottom: 0;
    }
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 1.5em 0;
    background-color: var(--color-border);
    border: 0;
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 1em;
    padding-left: 2em;

    ul,
    ol {
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  li {
    margin-bottom: 0.25em;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    overflow: auto;

    th,
    td {
      padding: 0.5em 1em;
      border: 1px solid var(--color-border);
    }

    th {
      font-weight: 600;
      background-color: var(--color-surface);
    }

    tr:nth-child(2n) {
      background-color: var(--color-surface);
    }
  }

  // Print styles
  @media print {
    font-size: 12pt;

    a {
      text-decoration: underline;
      color: #000;
    }

    pre,
    code {
      border: 1px solid #ddd;
      background-color: #f8f8f8 !important;
      color: #333 !important;
    }

    pre {
      page-break-inside: avoid;
    }

    img {
      max-width: 100% !important;
      page-break-inside: avoid;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    table,
    figure {
      page-break-inside: avoid;
    }
  }
}
</style>
