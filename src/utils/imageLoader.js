/**
 * Utility for responsive image loading
 * This helps optimize image loading based on device size and resolution
 */

/**
 * Get the appropriate image source based on screen size
 * @param {Object} sources - Object containing image sources for different sizes
 * @param {String} defaultSrc - Default image source if no matching size is found
 * @returns {String} - The appropriate image source
 */
export function getResponsiveImageSource(sources, defaultSrc) {
  const width = window.innerWidth;

  if (width <= 640 && sources.small) {
    return sources.small;
  } else if (width <= 1024 && sources.medium) {
    return sources.medium;
  } else if (width > 1024 && sources.large) {
    return sources.large;
  }

  return defaultSrc;
}

/**
 * Lazy load an image with IntersectionObserver
 * @param {HTMLImageElement} imgElement - The image element to lazy load
 * @param {String} src - The source URL of the image
 */
export function lazyLoadImage(imgElement, src) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(imgElement);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    imgElement.src = src;
  }
}

/**
 * Generate srcset attribute for responsive images
 * @param {String} basePath - Base path of the image
 * @param {String} filename - Filename without extension
 * @param {String} ext - File extension
 * @param {Array} sizes - Array of sizes to include in srcset
 * @returns {String} - srcset attribute value
 */
export function generateSrcSet(basePath, filename, ext, sizes) {
  return sizes.map(size => `${basePath}/${filename}-${size}.${ext} ${size}w`).join(', ');
}

/**
 * Preload critical images
 * @param {Array} imagePaths - Array of image paths to preload
 */
export function preloadCriticalImages(imagePaths) {
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
}
