<template>
  <ThemeProvider>
    <div id="app">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </ThemeProvider>
</template>

<script>
import ThemeProvider from './components/common/ThemeProvider.vue';

export default {
  name: 'App',
  components: {
    ThemeProvider
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
</style>
