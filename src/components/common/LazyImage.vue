<template>
  <div class="lazy-image-container" :style="{ paddingBottom: aspectRatio + '%' }">
    <img
      ref="image"
      :src="loadedSrc || placeholder"
      :srcset="loadedSrcset"
      :sizes="sizes"
      :alt="alt"
      :class="['lazy-image', { 'lazy-image-loaded': isLoaded }]"
      @load="onImageLoaded"
    />
    <div v-if="!isLoaded" class="lazy-image-placeholder">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    srcset: {
      type: String,
      default: ''
    },
    sizes: {
      type: String,
      default: '100vw'
    },
    alt: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMWUxZTEiLz48L3N2Zz4='
    },
    aspectRatio: {
      type: Number,
      default: 56.25 // 16:9 aspect ratio by default
    }
  },
  data() {
    return {
      observer: null,
      isLoaded: false,
      loadedSrc: '',
      loadedSrcset: ''
    };
  },
  mounted() {
    this.setupIntersectionObserver();
  },
  beforeUnmount() {
    this.destroyIntersectionObserver();
  },
  methods: {
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(this.onIntersect, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });
        this.observer.observe(this.$refs.image);
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        this.loadImage();
      }
    },
    onIntersect(entries) {
      if (entries[0].isIntersecting) {
        this.loadImage();
        this.destroyIntersectionObserver();
      }
    },
    loadImage() {
      this.loadedSrc = this.src;
      this.loadedSrcset = this.srcset;
    },
    onImageLoaded() {
      this.isLoaded = true;
    },
    destroyIntersectionObserver() {
      if (this.observer && this.$refs.image) {
        this.observer.unobserve(this.$refs.image);
        this.observer = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.lazy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
