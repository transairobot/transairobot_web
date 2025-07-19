<template>
  <div class="reset-password-page">
    <AppContainer size="small">
      <AppCard>
        <h1 class="reset-password-title">Reset Your Password</h1>
        <form @submit.prevent="handleSubmit" class="reset-password-form">
          <div v-if="!submitted">
            <div class="form-group">
              <label for="password">New Password</label>
              <input
                type="password"
                id="password"
                v-model="form.password"
                class="form-control"
                required
                placeholder="Enter new password"
              />
              <small class="form-text"
                >Password must be at least 8 characters with uppercase, lowercase, and
                numbers</small
              >
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="form.confirmPassword"
                class="form-control"
                required
                placeholder="Confirm new password"
              />
            </div>

            <div class="form-actions">
              <AppButton type="submit" :disabled="loading" block>
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </AppButton>
            </div>
          </div>

          <div v-else class="success-message">
            <p>Your password has been successfully reset.</p>
            <div class="form-actions">
              <AppButton @click="$router.push('/login')" block>Login with New Password</AppButton>
            </div>
          </div>

          <div v-if="error" class="form-error">
            {{ error }}
          </div>
        </form>
      </AppCard>
    </AppContainer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import authService from '../services/auth.service';
import { validatePassword } from '../utils/validation';

export default {
  name: 'ResetPasswordPage',
  components: {
    AppContainer,
    AppCard,
    AppButton
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const form = ref({
      password: '',
      confirmPassword: ''
    });

    const loading = ref(false);
    const error = ref(null);
    const submitted = ref(false);
    const token = ref('');

    onMounted(() => {
      // Get token from URL
      token.value = route.query.token;

      if (!token.value) {
        error.value = 'Invalid or missing reset token. Please request a new password reset link.';
      }
    });

    const validateForm = () => {
      if (form.value.password !== form.value.confirmPassword) {
        error.value = 'Passwords do not match';
        return false;
      }

      const passwordValidation = validatePassword(form.value.password);
      if (!passwordValidation.isValid) {
        error.value = passwordValidation.message;
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        await authService.resetPassword(token.value, form.value.password);
        submitted.value = true;
      } catch (err) {
        error.value = err.message || 'Failed to reset password. Please try again.';
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
.reset-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.reset-password-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.reset-password-form {
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

    .form-text {
      display: block;
      margin-top: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.8rem;
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
}
</style>
