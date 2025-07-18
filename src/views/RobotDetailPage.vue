<template>
  <div class="robot-detail-page">
    <AppHeader />
    <main>
      <div class="container">
        <h1>Robot Detail</h1>
        <p>Coming soon...</p>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';

export default {
  name: 'RobotDetailPage',
  components: {
    AppHeader,
    AppFooter
  }
};
</script>

<style lang="scss" scoped>
.robot-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: $spacing-2xl 0;
  }
}
</style>
