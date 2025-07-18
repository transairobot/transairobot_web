<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .app-main {
    flex: 1;
    padding: $spacing-lg 0;

    // Add responsive padding adjustments
    @media (max-width: $breakpoint-sm) {
      padding: $spacing-md 0;
    }

    @media (min-width: $breakpoint-lg) {
      padding: $spacing-xl 0;
    }
  }
}
</style>
