/**
 * Utility for optimizing font loading
 * This helps improve performance by controlling how fonts are loaded
 */

/**
 * Load fonts using the Font Loading API with fallback
 * @param {Array} fontFamilies - Array of font family configurations
 * @example
 * loadFonts([
 *   { family: 'Roboto', weight: '400', style: 'normal' },
 *   { family: 'Roboto', weight: '700', style: 'normal' }
 * ]);
 */
export function loadFonts(fontFamilies) {
  if ('fonts' in document) {
    const fontPromises = fontFamilies.map(font => {
      return document.fonts.load(`${font.weight} ${font.style} 1em ${font.family}`);
    });

    Promise.all(fontPromises)
      .then(() => {
        document.documentElement.classList.add('fonts-loaded');
      })
      .catch(error => {
        console.error('Font loading failed:', error);
        // Add the class anyway to ensure text is visible
        document.documentElement.classList.add('fonts-loaded');
      });
  } else {
    // Fallback for browsers without Font Loading API
    // Add a class after a timeout to ensure text is visible
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
    }, 1000);
  }
}

/**
 * Create a font-display CSS rule to prevent invisible text during font loading
 */
export function createFontDisplayStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Preload critical fonts
 * @param {Array} fontUrls - Array of font URLs to preload
 */
export function preloadCriticalFonts(fontUrls) {
  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}
