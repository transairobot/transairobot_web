<template>
  <div class="forgot-password-page">
    <AppContainer size="small">
      <AppCard>
        <h1 class="forgot-password-title">Reset Password</h1>
        <form @submit.prevent="handleSubmit" class="forgot-password-form">
          <div v-if="!submitted">
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

            <div class="form-actions">
              <AppButton type="submit" :disabled="loading" block>
                {{ loading ? 'Sending...' : 'Send Reset Link' }}
              </AppButton>
            </div>
          </div>

          <div v-else class="success-message">
            <p>
              If an account exists with the email {{ form.email }}, you will receive password reset
              instructions.
            </p>
            <div class="form-actions">
              <AppButton @click="$router.push('/login')" block>Back to Login</AppButton>
            </div>
          </div>

          <div v-if="error" class="form-error">
            {{ error }}
          </div>

          <div class="form-links">
            <router-link to="/login">Back to Login</router-link>
          </div>
        </form>
      </AppCard>
    </AppContainer>
  </div>
</template>

<script>
import { ref } from 'vue';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import authService from '../services/auth.service';

export default {
  name: 'ForgotPasswordPage',
  components: {
    AppContainer,
    AppCard,
    AppButton
  },
  setup() {
    const form = ref({
      email: ''
    });

    const loading = ref(false);
    const error = ref(null);
    const submitted = ref(false);

    const handleSubmit = async () => {
      try {
        loading.value = true;
        error.value = null;

        await authService.requestPasswordReset(form.value.email);
        submitted.value = true;
      } catch (err) {
        error.value = err.message || 'Failed to send reset link. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      submitted,
      handleSubmit
    };
  }
};
</script>

<style lang="scss" scoped>
.forgot-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.forgot-password-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.forgot-password-form {
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

  .success-message {
    text-align: center;
    margin: 1rem 0;
    color: var(--text-primary);
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
