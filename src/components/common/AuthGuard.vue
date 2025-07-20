<template>
  <div v-if="loading" class="auth-guard-loading">
    <LoadingState message="Verifying authentication..." />
  </div>
  <div v-else-if="error" class="auth-guard-error">
    <ErrorState :message="error" />
    <div class="auth-guard-actions">
      <AppButton @click="$router.push('/login')" variant="primary">Login</AppButton>
      <AppButton @click="$router.push('/')" variant="secondary">Go to Home</AppButton>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import LoadingState from './LoadingState.vue';
import ErrorState from './ErrorState.vue';
import AppButton from './AppButton.vue';

export default {
  name: 'AuthGuard',
  components: {
    LoadingState,
    ErrorState,
    AppButton
  },
  props: {
    requiredRole: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    const loading = ref(true);
    const error = ref(null);

    const verifyAuth = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Check if user is authenticated
        const isAuthenticated = store.getters['auth/isAuthenticated'];
        if (!isAuthenticated) {
          error.value = 'You must be logged in to access this page';
          router.push('/login');
          return false;
        }

        // If a specific role is required, check user role
        if (props.requiredRole) {
          const userRole = store.getters['auth/userRole'];
          if (userRole !== props.requiredRole && userRole !== 'admin') {
            error.value = 'You do not have permission to access this page';
            return false;
          }
        }

        return true;
      } catch (err) {
        error.value = err.message || 'Authentication error';
        return false;
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await verifyAuth();
    });

    return {
      loading,
      error
    };
  }
};
</script>

<style lang="scss" scoped>
.auth-guard-loading,
.auth-guard-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.auth-guard-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
