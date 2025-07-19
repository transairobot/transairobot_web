<template>
  <div class="basic-info-form">
    <h3 class="form-section-title">Basic Information</h3>
    <p class="form-section-description">Provide the essential details about your application</p>

    <div class="form-group">
      <label for="app-name">Application Name*</label>
      <input
        id="app-name"
        v-model="form.name"
        type="text"
        class="form-control"
        placeholder="Enter application name"
        @blur="validateField('name')"
      />
      <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
    </div>

    <div class="form-group">
      <label for="app-version">Version*</label>
      <input
        id="app-version"
        v-model="form.version"
        type="text"
        class="form-control"
        placeholder="e.g. 1.0.0"
        @blur="validateField('version')"
      />
      <p v-if="errors.version" class="error-message">{{ errors.version }}</p>
    </div>

    <div class="form-group">
      <label>Category*</label>
      <div class="checkbox-group">
        <div v-for="category in categories" :key="category.value" class="checkbox-item">
          <input
            :id="'category-' + category.value"
            type="checkbox"
            :value="category.value"
            v-model="form.category"
            @change="validateField('category')"
          />
          <label :for="'category-' + category.value">{{ category.label }}</label>
        </div>
      </div>
      <p v-if="errors.category" class="error-message">{{ errors.category }}</p>
    </div>

    <div class="form-group">
      <label>Pricing</label>
      <div class="pricing-options">
        <div class="radio-item">
          <input id="price-free" type="radio" v-model="form.isPaid" :value="false" />
          <label for="price-free">Free</label>
        </div>
        <div class="radio-item">
          <input id="price-paid" type="radio" v-model="form.isPaid" :value="true" />
          <label for="price-paid">Paid</label>
        </div>
      </div>

      <div v-if="form.isPaid" class="price-input">
        <label for="app-price">Price ($)*</label>
        <input
          id="app-price"
          v-model.number="form.price"
          type="number"
          min="0.99"
          step="0.01"
          class="form-control"
          placeholder="Enter price"
          @blur="validateField('price')"
        />
        <p v-if="errors.price" class="error-message">{{ errors.price }}</p>
      </div>
    </div>

    <div class="form-actions">
      <AppButton @click="nextStep" variant="primary" :disabled="!isFormValid"> Continue </AppButton>
    </div>
  </div>
</template>

<script>
import { reactive, computed, watch } from 'vue';
import { validateForm } from '../../../utils/validation';
import AppButton from '../../common/AppButton.vue';

export default {
  name: 'BasicInfoForm',
  components: {
    AppButton
  },
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:form-data', 'next-step'],
  setup(props, { emit }) {
    const form = reactive({
      name: props.formData.name || '',
      version: props.formData.version || '1.0.0',
      category: props.formData.category || [],
      isPaid: props.formData.isPaid || false,
      price: props.formData.price || 0.99
    });

    const errors = reactive({
      name: '',
      version: '',
      category: '',
      price: ''
    });

    const categories = [
      { value: 'navigation', label: 'Navigation' },
      { value: 'vision', label: 'Computer Vision' },
      { value: 'manipulation', label: 'Manipulation' },
      { value: 'voice', label: 'Voice Control' },
      { value: 'utility', label: 'Utility' },
      { value: 'entertainment', label: 'Entertainment' },
      { value: 'education', label: 'Education' },
      { value: 'other', label: 'Other' }
    ];

    const validationRules = {
      name: {
        required: true,
        minLength: 3,
        maxLength: 50
      },
      version: {
        required: true,
        pattern: /^\d+\.\d+\.\d+$/,
        message: 'Version must be in format X.Y.Z (e.g. 1.0.0)'
      },
      category: {
        required: true,
        custom: value => {
          return value.length === 0 ? 'Select at least one category' : '';
        }
      },
      price: {
        custom: (value, fields) => {
          if (fields.isPaid && (value < 0.99 || value > 999.99)) {
            return 'Price must be between $0.99 and $999.99';
          }
          return '';
        }
      }
    };

    const validateField = field => {
      const result = validateForm({ [field]: form[field] }, { [field]: validationRules[field] });
      errors[field] = result[field] || '';
    };

    const validateAllFields = () => {
      const result = validateForm(form, validationRules);
      Object.keys(errors).forEach(key => {
        errors[key] = result[key] || '';
      });
    };

    const isFormValid = computed(() => {
      validateAllFields();
      return !Object.values(errors).some(error => error);
    });

    const nextStep = () => {
      validateAllFields();

      if (isFormValid.value) {
        emit('update:form-data', {
          name: form.name,
          version: form.version,
          category: form.category,
          isPaid: form.isPaid,
          price: form.price
        });

        emit('next-step');
      }
    };

    // Watch for changes in the parent formData
    watch(
      () => props.formData,
      newVal => {
        form.name = newVal.name || form.name;
        form.version = newVal.version || form.version;
        form.category = newVal.category || form.category;
        form.isPaid = newVal.isPaid;
        form.price = newVal.price || form.price;
      },
      { deep: true }
    );

    return {
      form,
      errors,
      categories,
      validateField,
      isFormValid,
      nextStep
    };
  }
};
</script>

<style lang="scss" scoped>
.basic-info-form {
  .form-section-title {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .form-section-description {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 1rem;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2);
      }

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
  }

  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;

    .checkbox-item {
      display: flex;
      align-items: center;

      input[type='checkbox'] {
        margin-right: 0.5rem;
      }
    }
  }

  .pricing-options {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;

    .radio-item {
      display: flex;
      align-items: center;

      input[type='radio'] {
        margin-right: 0.5rem;
      }
    }
  }

  .price-input {
    margin-top: 1rem;
  }

  .form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
