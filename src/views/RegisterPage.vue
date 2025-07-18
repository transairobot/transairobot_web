<template>
  <div class="register-page">
    <Container size="small">
      <AppCard>
        <h1 class="register-title">Create Account</h1>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="nickname">Name</label>
            <input
              type="text"
              id="nickname"
              v-model="form.nickname"
              class="form-control"
              required
              placeholder="Enter your name"
            />
          </div>

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
              placeholder="Create a password"
            />
            <small class="form-text"
              >Password must be at least 8 characters with uppercase, lowercase, and numbers</small
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
              placeholder="Confirm your password"
            />
          </div>

          <div class="form-actions">
            <AppButton type="submit" :disabled="loading" block>
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </AppButton>
          </div>

          <div v-if="error" class="form-error">
            {{ error }}
          </div>

          <div class="form-links">
            <router-link to="/login">Already have an account? Login</router-link>
          </div>
        </form>
      </AppCard>
    </Container>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Container from '../components/common/Container.vue';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import { validatePassword } from '../utils/validation';

export default {
  name: 'RegisterPage',
  components: {
    Container,
    AppCard,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const form = ref({
      nickname: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const loading = ref(false);
    const error = ref(null);

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

    const handleRegister = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        // This would be replaced with an actual API call
        setTimeout(() => {
          const mockUser = {
            id: '1',
            nickname: form.value.nickname,
            account: form.value.email.split('@')[0],
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
        error.value = err.message || 'Failed to register. Please try again.';
      }
    };

    return {
      form,
      loading,
      error,
      handleRegister
    };
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.register-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.register-form {
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
