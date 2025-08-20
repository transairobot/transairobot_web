/**
 * Utility for lazy loading components with dynamic imports
 * This helps with code splitting and improves initial load performance
 *
 * @param {Function} importFn - Dynamic import function that returns a Promise
 * @returns {Object} - Async component definition
 */
export function lazyLoadComponent(importFn) {
  return {
    // Use dynamic import for the component
    component: importFn,
    // Display a loading component while the async component is loading
    loading: {
      template: '<div class="component-loading"><div class="loading-spinner"></div></div>'
    },
    // Handle any errors during loading
    error: {
      template: '<div class="component-error">Error loading component</div>'
    },
    // Delay before showing the loading component
    delay: 200,
    // Timeout if the component takes too long to load
    timeout: 10000
  };
}

/**
 * Utility for lazy loading view components
 * Specifically optimized for route components
 *
 * @param {String} viewPath - Path to the view component
 * @returns {Function} - Dynamic import function
 */
export function lazyLoadView(viewPath) {
  return () => import(/* webpackChunkName: "view-[request]" */ `@/views/${viewPath}.vue`);
}
