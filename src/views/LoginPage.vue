<template>
  <div class="login-page">
    <AppContainer size="small">
      <AppCard>
        <h1 class="login-title">Login</h1>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="form-control"
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              class="form-control"
              required
              placeholder="Enter your password"
            />
          </div>

          <div class="form-actions">
            <AppButton type="submit" :disabled="loading" block>
              {{ loading ? 'Logging in...' : 'Login' }}
            </AppButton>
          </div>

          <div v-if="error" class="form-error">
            {{ error }}
          </div>

          <div class="form-links">
            <router-link to="/register">Don't have an account? Register</router-link>
            <router-link to="/forgot-password">Forgot password?</router-link>
          </div>
        </form>
      </AppCard>
    </AppContainer>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';

export default {
  name: 'LoginPage',
  components: {
    AppContainer,
    AppCard,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const form = ref({
      email: 'test@example.com',
      password: 'password123'
    });

    const loading = ref(false);
    const error = ref(null);

    const handleLogin = async () => {
      try {
        loading.value = true;
        error.value = null;

        // This would be replaced with an actual API call
        setTimeout(() => {
          const mockUser = {
            id: '1',
            nickname: 'John Doe',
            account: 'johndoe',
            email: form.value.email,
            avatar: '/assets/images/avatar.png',
            role: 'user'
          };

          const mockToken = 'mock-jwt-token';

          store.dispatch('auth/login', {
            token: mockToken,
            user: mockUser
          });

          router.push('/');
          loading.value = false;
        }, 1000);
      } catch (err) {
        loading.value = false;
        error.value = err.message || 'Failed to login. Please try again.';
      }
    };

    return {
      form,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--input-bg);
      color: var(--text-primary);
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
      }
    }
  }

  .form-actions {
    margin-top: 2rem;
  }

  .form-error {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: var(--error-bg);
    color: var(--error-color);
    font-size: 0.9rem;
  }

  .form-links {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;

    a {
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
