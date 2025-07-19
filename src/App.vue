<template>
  <ThemeProvider>
    <div id="app">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <OfflineStatus />
    </div>
  </ThemeProvider>
</template>

<script>
import ThemeProvider from './components/common/ThemeProvider.vue';
import OfflineStatus from './components/common/OfflineStatus.vue';

export default {
  name: 'App',
  components: {
    ThemeProvider,
    OfflineStatus
  }
};
</script>

<style lang="scss">
@import './assets/styles/global.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
