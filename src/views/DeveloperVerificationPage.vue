<template>
  <div class="developer-verification-page">
    <AppHeader />
    <main>
      <AppContainer>
        <VerificationPending />
      </AppContainer>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import AppContainer from '../components/common/AppContainer.vue';
import VerificationPending from '../components/developer/VerificationPending.vue';

export default {
  name: 'DeveloperVerificationPage',
  components: {
    AppHeader,
    AppFooter,
    AppContainer,
    VerificationPending
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    onMounted(() => {
      const currentUser = store.getters['auth/currentUser'];

      // If user is not logged in or doesn't have a pending developer status, redirect to home
      if (
        !currentUser ||
        !currentUser.developerStatus ||
        currentUser.developerStatus !== 'pending'
      ) {
        router.push('/');
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.developer-verification-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }
}
</style>
