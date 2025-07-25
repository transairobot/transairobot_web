<template>
  <AuthLayout>
    <h1 class="auth-title">Log in to TransAIRobot</h1>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <div class="input-wrapper">
          <span class="input-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </span>
          <input
            type="email"
            v-model="form.email"
            class="form-control"
            required
            placeholder="Enter Your Email"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <span class="input-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          <input
            :type="passwordFieldType"
            v-model="form.password"
            class="form-control"
            required
            placeholder="Enter Your Password"
          />
          <button type="button" @click="togglePasswordVisibility" class="password-toggle">
            <svg
              v-if="passwordFieldType === 'password'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <div class="forgot-password-link">
          <router-link to="/forgot-password">Forgot password?</router-link>
        </div>
      </div>

      <div class="form-actions">
        <AppButton type="submit" :disabled="loading" block variant="secondary">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </AppButton>
      </div>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-links">
        <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
      </div>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AuthLayout from '../components/common/AuthLayout.vue';
import AppButton from '../components/common/AppButton.vue';

export default {
  name: 'LoginPage',
  components: {
    AuthLayout,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const form = ref({
      email: '',
      password: ''
    });

    const loading = ref(false);
    const error = ref(null);
    const passwordFieldType = ref('password');

    const handleLogin = async () => {
      try {
        loading.value = true;
        error.value = null;
        await store.dispatch('auth/login', form.value);
        await nextTick();
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
      } catch (err) {
        error.value = err.message || 'Failed to login. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const togglePasswordVisibility = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
    };

    return {
      form,
      loading,
      error,
      passwordFieldType,
      handleLogin,
      togglePasswordVisibility
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.auth-title {
  text-align: center;
  margin-bottom: $spacing-xl;
  color: var(--text-primary);
  font-size: $font-size-2xl;
  font-weight: 600;
}

.auth-form {
  .form-group {
    margin-bottom: $spacing-lg;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: $spacing-md;
    color: var(--text-secondary);
  }

  .form-control {
    width: 100%;
    padding: $spacing-md $spacing-md $spacing-md 40px;
    border: 1px solid var(--input-border);
    border-radius: $border-radius-md;
    background-color: var(--input-bg);
    color: var(--text-primary);
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
  }

  .password-toggle {
    position: absolute;
    right: $spacing-md;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .forgot-password-link {
    text-align: right;
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    a {
      color: var(--accent-primary);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .form-actions {
    margin-top: $spacing-lg;
  }

  .form-error {
    margin-top: $spacing-md;
    text-align: center;
    color: var(--error-color);
  }

  .separator {
    text-align: center;
    margin: $spacing-lg 0;
    color: var(--text-secondary);
    font-size: $font-size-sm;
  }

  .social-login {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .social-btn {
    background-color: var(--background-primary);
    color: var(--text-primary);
    border: 1px solid var(--input-border);
    &:hover {
      background-color: var(--background-secondary);
    }
  }

  .form-links {
    margin-top: $spacing-xl;
    text-align: center;
    font-size: $font-size-sm;
    color: var(--text-secondary);
    a {
      color: var(--accent-primary);
      font-weight: 600;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
