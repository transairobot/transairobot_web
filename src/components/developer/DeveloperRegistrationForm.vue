<template>
  <div class="developer-registration-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="companyName">Company Name</label>
        <input
          type="text"
          id="companyName"
          v-model="form.companyName"
          class="form-control"
          required
          placeholder="Enter your company name"
        />
        <div v-if="errors.companyName" class="form-error">{{ errors.companyName }}</div>
      </div>

      <div class="form-group">
        <label for="website">Company Website</label>
        <input
          type="url"
          id="website"
          v-model="form.website"
          class="form-control"
          required
          placeholder="https://example.com"
        />
        <div v-if="errors.website" class="form-error">{{ errors.website }}</div>
      </div>

      <div class="form-group">
        <label for="description">Developer Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="4"
          required
          placeholder="Tell us about your company and the applications you plan to develop"
        ></textarea>
        <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
      </div>

      <div class="form-group">
        <label for="developerType">Developer Type</label>
        <select id="developerType" v-model="form.developerType" class="form-control" required>
          <option value="" disabled selected>Select developer type</option>
          <option value="individual">Individual Developer</option>
          <option value="company">Company</option>
          <option value="academic">Academic Institution</option>
          <option value="nonprofit">Non-profit Organization</option>
        </select>
        <div v-if="errors.developerType" class="form-error">{{ errors.developerType }}</div>
      </div>

      <div class="form-group">
        <label>Development Experience</label>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="typescript" v-model="form.experience.typescript" />
            <label for="typescript">TypeScript</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="rust" v-model="form.experience.rust" />
            <label for="rust">Rust</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="wasm" v-model="form.experience.wasm" />
            <label for="wasm">WebAssembly</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="robotics" v-model="form.experience.robotics" />
            <label for="robotics">Robotics</label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="termsAgreement">
          <input type="checkbox" id="termsAgreement" v-model="form.termsAgreement" required />
          I agree to the
          <a href="#" @click.prevent="showTerms = true">Developer Terms and Conditions</a>
        </label>
        <div v-if="errors.termsAgreement" class="form-error">{{ errors.termsAgreement }}</div>
      </div>

      <div class="form-actions">
        <AppButton type="submit" :disabled="loading" block>
          {{ loading ? 'Submitting Application...' : 'Submit Developer Application' }}
        </AppButton>
      </div>

      <div v-if="error" class="form-error-message">
        {{ error }}
      </div>
    </form>

    <AppModal v-model="showTerms" title="Developer Terms and Conditions" size="large">
      <div class="terms-content">
        <h3>TransAIRobot Developer Program Terms</h3>
        <p>Last Updated: July 19, 2025</p>

        <h4>1. Introduction</h4>
        <p>
          These Developer Terms and Conditions ("Terms") govern your participation in the
          TransAIRobot Developer Program and your use of our developer tools, APIs, and services.
        </p>

        <h4>2. Developer Account</h4>
        <p>
          To become a registered developer, you must complete the application process and be
          approved by TransAIRobot. We reserve the right to approve or reject any application at our
          discretion.
        </p>

        <h4>3. Application Development</h4>
        <p>
          All applications must be developed using TypeScript or Rust and packaged as WebAssembly
          (WASM) modules. Applications must comply with our technical specifications and quality
          standards.
        </p>

        <h4>4. Application Review</h4>
        <p>
          All applications submitted to the TransAIRobot Application Store will undergo a review
          process to ensure they meet our quality, security, and performance standards.
        </p>

        <h4>5. Intellectual Property</h4>
        <p>
          You retain ownership of your applications, but grant TransAIRobot a non-exclusive license
          to distribute your applications through our Application Store.
        </p>

        <h4>6. Privacy and Data Security</h4>
        <p>
          Applications must comply with all applicable privacy laws and our data security
          requirements. You must provide a privacy policy for any application that collects user
          data.
        </p>

        <h4>7. Termination</h4>
        <p>
          TransAIRobot reserves the right to terminate your developer account and remove your
          applications from the Application Store for violations of these Terms.
        </p>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showTerms = false">Close</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppButton from '../common/AppButton.vue';
import AppModal from '../common/AppModal.vue';
import { validateForm, isValidUrl } from '../../utils/validation';

export default {
  name: 'DeveloperRegistrationForm',
  components: {
    AppButton,
    AppModal
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const form = reactive({
      companyName: '',
      website: '',
      description: '',
      developerType: '',
      experience: {
        typescript: false,
        rust: false,
        wasm: false,
        robotics: false
      },
      termsAgreement: false
    });

    const errors = reactive({});
    const loading = ref(false);
    const error = ref(null);
    const showTerms = ref(false);

    const validateDeveloperForm = () => {
      const validationRules = {
        companyName: { required: true, minLength: 2 },
        website: {
          required: true,
          custom: value => {
            if (!isValidUrl(value)) {
              return 'Please enter a valid URL';
            }
            return null;
          }
        },
        description: { required: true, minLength: 50 },
        developerType: { required: true },
        termsAgreement: {
          custom: value => {
            if (!value) {
              return 'You must agree to the terms and conditions';
            }
            return null;
          }
        }
      };

      const newErrors = validateForm(form, validationRules);

      // Copy validation errors to reactive errors object
      Object.keys(errors).forEach(key => {
        delete errors[key];
      });

      Object.keys(newErrors).forEach(key => {
        errors[key] = newErrors[key];
      });

      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateDeveloperForm()) {
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        // This would be replaced with an actual API call
        // Simulating API call with setTimeout
        setTimeout(() => {
          // Update user role to developer (pending)
          const currentUser = store.getters['auth/currentUser'];
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              developerStatus: 'pending',
              developerProfile: {
                companyName: form.companyName,
                website: form.website,
                description: form.description,
                developerType: form.developerType,
                experience: { ...form.experience }
              }
            };

            store.dispatch('auth/updateUser', updatedUser);

            // Redirect to verification pending page
            router.push('/developer/verification');
          } else {
            error.value = 'You must be logged in to register as a developer';
          }

          loading.value = false;
        }, 1500);
      } catch (err) {
        loading.value = false;
        error.value = err.message || 'Failed to submit developer application. Please try again.';
      }
    };

    return {
      form,
      errors,
      loading,
      error,
      showTerms,
      handleSubmit
    };
  }
};
</script>

<style lang="scss" scoped>
.developer-registration-form {
  max-width: 800px;
  margin: 0 auto;
}

.form {
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

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }

    .form-error {
      margin-top: 0.5rem;
      color: var(--error-color);
      font-size: 0.875rem;
    }
  }

  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;

    .checkbox-item {
      display: flex;
      align-items: center;

      input[type='checkbox'] {
        margin-right: 0.5rem;
      }
    }
  }

  .form-actions {
    margin-top: 2rem;
  }

  .form-error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: var(--error-bg);
    color: var(--error-color);
    font-size: 0.9rem;
  }
}

.terms-content {
  h3,
  h4 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    margin-bottom: 1rem;
  }
}
</style>
