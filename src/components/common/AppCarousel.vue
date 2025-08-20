<template>
  <div class="app-carousel">
    <div class="carousel-container" ref="carouselContainer">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="carousel-slide">
          <slot :item="slide" :index="index"></slot>
        </div>
      </div>
    </div>

    <div class="carousel-controls" v-if="showControls && slides.length > 1">
      <button
        class="carousel-control carousel-control-prev"
        @click="prevSlide"
        :disabled="!loop && currentSlide === 0"
      >
        <span class="control-icon">←</span>
      </button>

      <div class="carousel-indicators" v-if="showIndicators">
        <button
          v-for="(_, index) in slides"
          :key="index"
          class="carousel-indicator"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></button>
      </div>

      <button
        class="carousel-control carousel-control-next"
        @click="nextSlide"
        :disabled="!loop && currentSlide === slides.length - 1"
      >
        <span class="control-icon">→</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppCarousel',
  props: {
    slides: {
      type: Array,
      required: true
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    autoplaySpeed: {
      type: Number,
      default: 5000
    },
    loop: {
      type: Boolean,
      default: true
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showIndicators: {
      type: Boolean,
      default: true
    },
    initialSlide: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentSlide: this.initialSlide,
      autoplayInterval: null,
      touchStartX: 0,
      touchEndX: 0
    };
  },
  mounted() {
    this.startAutoplay();

    // Add touch events for mobile swipe
    const container = this.$refs.carouselContainer;
    if (container) {
      container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    // Add resize listener
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.stopAutoplay();

    // Remove event listeners
    const container = this.$refs.carouselContainer;
    if (container) {
      container.removeEventListener('touchstart', this.handleTouchStart);
      container.removeEventListener('touchend', this.handleTouchEnd);
    }

    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    nextSlide() {
      if (this.currentSlide < this.slides.length - 1) {
        this.currentSlide++;
      } else if (this.loop) {
        this.currentSlide = 0;
      }
      this.resetAutoplay();
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      } else if (this.loop) {
        this.currentSlide = this.slides.length - 1;
      }
      this.resetAutoplay();
    },
    goToSlide(index) {
      this.currentSlide = index;
      this.resetAutoplay();
    },
    startAutoplay() {
      if (this.autoplay && this.slides.length > 1) {
        this.autoplayInterval = setInterval(() => {
          this.nextSlide();
        }, this.autoplaySpeed);
      }
    },
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    },
    resetAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
    },
    handleTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    },
    handleSwipe() {
      const diff = this.touchStartX - this.touchEndX;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left, go to next slide
          this.nextSlide();
        } else {
          // Swipe right, go to previous slide
          this.prevSlide();
        }
      }
    },
    handleResize() {
      // Handle any resize-related adjustments if needed
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;

  .carousel-container {
    width: 100%;
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    transition: transform 0.5s ease;
    width: 100%;
  }

  .carousel-slide {
    flex: 0 0 100%;
    width: 100%;
  }

  .carousel-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $spacing-md;

    .carousel-control {
      background: var(--bg-secondary);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all $transition-fast ease;
      color: var(--text-primary);

      &:hover {
        background: var(--accent-primary);
        color: var(--button-text);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
      }

      .control-icon {
        font-size: $font-size-lg;
      }
    }

    .carousel-indicators {
      display: flex;
      gap: $spacing-xs;

      .carousel-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: none;
        cursor: pointer;
        transition: all $transition-fast ease;

        &.active {
          background: var(--accent-primary);
          transform: scale(1.2);
        }

        &:hover:not(.active) {
          background: var(--text-secondary);
        }
      }
    }
  }
}
</style>
