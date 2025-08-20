import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { loadFonts, createFontDisplayStyle, preloadCriticalFonts } from './utils/fontLoader';
import { preloadCriticalImages } from './utils/imageLoader';

// Initialize the Vue application
const app = createApp(App);
app.use(router).use(store).mount('#app');

// Optimize font loading
createFontDisplayStyle();
loadFonts([
  { family: 'Roboto', weight: '400', style: 'normal' },
  { family: 'Roboto', weight: '700', style: 'normal' }
]);

// Preload critical fonts
preloadCriticalFonts([
  '/fonts/roboto-v30-latin-regular.woff2',
  '/fonts/roboto-v30-latin-700.woff2'
]);

// Preload critical images
preloadCriticalImages(['/assets/images/logo.svg', '/assets/images/hero-background-small.webp']);

// Register service worker for production environment
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/transairobot-sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
