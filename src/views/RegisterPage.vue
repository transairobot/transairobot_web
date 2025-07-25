<template>
  <AuthLayout>
    <h1 class="auth-title">Create an account</h1>
    <form @submit.prevent="handleRegister" class="auth-form">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <input
            type="text"
            v-model="form.nickname"
            class="form-control"
            required
            placeholder="Enter Your Name"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper email-wrapper">
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
          <AppButton
            type="button"
            @click="sendVerificationCode"
            :disabled="!isEmailValid || sendingCode"
            class="send-code-btn"
            variant="text"
          >
            {{ sendingCode ? 'Sending...' : 'Send Code' }}
          </AppButton>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          <input
            type="text"
            v-model="form.verificationCode"
            class="form-control"
            required
            placeholder="Enter Verification Code"
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
            type="password"
            v-model="form.password"
            class="form-control"
            required
            placeholder="Create a password"
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
            type="password"
            v-model="form.confirmPassword"
            class="form-control"
            required
            placeholder="Confirm your password"
          />
        </div>
      </div>

      <div class="form-actions">
        <AppButton type="submit" :disabled="loading" block variant="secondary">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </AppButton>
      </div>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <div class="form-links">
        <p>Already have an account? <router-link to="/login">Log in</router-link></p>
      </div>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AuthLayout from '../components/common/AuthLayout.vue';
import AppButton from '../components/common/AppButton.vue';
import { validatePassword, isValidEmail } from '../utils/validation';

export default {
  name: 'RegisterPage',
  components: {
    AuthLayout,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const form = ref({
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: ''
    });

    const loading = ref(false);
    const sendingCode = ref(false);
    const error = ref(null);

    const isEmailValid = computed(() => isValidEmail(form.value.email));

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
      if (!form.value.verificationCode) {
        error.value = 'Please enter the verification code';
        return false;
      }
      return true;
    };

    const sendVerificationCode = async () => {
      if (!isEmailValid.value) {
        error.value = 'Please enter a valid email address.';
        return;
      }
      sendingCode.value = true;
      error.value = null;
      try {
        // This is where you would dispatch a Vuex action to call your API
        await store.dispatch('auth/sendVerificationCode', form.value.email);
        // You might want to show a success message to the user
      } catch (err) {
        error.value = err.message || 'Failed to send verification code.';
      } finally {
        sendingCode.value = false;
      }
    };

    const handleRegister = async () => {
      if (!validateForm()) {
        return;
      }
      try {
        loading.value = true;
        error.value = null;
        await store.dispatch('auth/register', form.value);
        router.push('/');
      } catch (err) {
        error.value = err.message || 'Failed to register. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      sendingCode,
      error,
      isEmailValid,
      handleRegister,
      sendVerificationCode
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

  .email-wrapper .form-control {
    padding-right: 120px; /* Make space for the button */
  }

  .send-code-btn {
    position: absolute;
    right: $spacing-xs;
    height: calc(100% - #{$spacing-xs * 2});
    padding: 0 $spacing-md;
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

  .form-actions {
    margin-top: $spacing-lg;
  }

  .form-error {
    margin-top: $spacing-md;
    text-align: center;
    color: var(--error-color);
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
