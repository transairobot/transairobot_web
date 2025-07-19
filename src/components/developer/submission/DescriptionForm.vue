<template>
  <div class="description-form">
    <h3 class="form-section-title">Application Description</h3>
    <p class="form-section-description">Provide detailed information about your application</p>

    <div class="form-group">
      <label for="short-description">Short Description*</label>
      <input
        id="short-description"
        v-model="form.shortDescription"
        type="text"
        class="form-control"
        placeholder="Brief summary of your application (max 100 characters)"
        maxlength="100"
        @blur="validateField('shortDescription')"
      />
      <div class="character-count">{{ form.shortDescription.length }}/100</div>
      <p v-if="errors.shortDescription" class="error-message">{{ errors.shortDescription }}</p>
    </div>

    <div class="form-group">
      <label for="full-description">Full Description*</label>
      <textarea
        id="full-description"
        v-model="form.fullDescription"
        class="form-control textarea"
        placeholder="Detailed description of your application, features, and benefits"
        rows="6"
        @blur="validateField('fullDescription')"
      ></textarea>
      <div class="character-count">{{ form.fullDescription.length }}/2000</div>
      <p v-if="errors.fullDescription" class="error-message">{{ errors.fullDescription }}</p>
    </div>

    <div class="form-group">
      <label>Tags</label>
      <div class="tags-input">
        <div class="tags-container">
          <span v-for="(tag, index) in form.tags" :key="index" class="tag">
            {{ tag }}
            <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
          </span>
        </div>
        <input
          v-model="tagInput"
          type="text"
          class="form-control"
          placeholder="Add tags (press Enter to add)"
          @keydown.enter.prevent="addTag"
        />
      </div>
      <p class="help-text">Add up to 5 tags to help users find your application</p>
    </div>

    <div class="form-group">
      <label for="app-icon">Application Icon*</label>
      <div class="file-upload">
        <div
          class="file-upload-area"
          :class="{ 'has-file': form.icon }"
          @click="$refs.iconInput.click()"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onIconDrop"
        >
          <input
            ref="iconInput"
            type="file"
            accept="image/png, image/jpeg"
            class="file-input"
            @change="onIconChange"
          />

          <div v-if="!form.icon" class="upload-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>Click or drag to upload icon (512×512px recommended)</p>
          </div>

          <div v-else class="file-preview">
            <img :src="iconPreview" alt="Icon preview" class="icon-preview" />
            <button type="button" class="remove-file" @click.stop="removeIcon">Remove</button>
          </div>
        </div>
      </div>
      <p v-if="errors.icon" class="error-message">{{ errors.icon }}</p>
    </div>

    <div class="form-actions">
      <AppButton @click="prevStep" variant="outline"> Back </AppButton>
      <AppButton @click="nextStep" variant="primary" :disabled="!isFormValid"> Continue </AppButton>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, watch } from 'vue';
import { validateForm } from '../../../utils/validation';
import AppButton from '../../common/AppButton.vue';

export default {
  name: 'DescriptionForm',
  components: {
    AppButton
  },
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:form-data', 'next-step', 'prev-step'],
  setup(props, { emit }) {
    const form = reactive({
      shortDescription: props.formData.shortDescription || '',
      fullDescription: props.formData.fullDescription || '',
      tags: props.formData.tags || [],
      icon: props.formData.icon || null
    });

    const errors = reactive({
      shortDescription: '',
      fullDescription: '',
      icon: ''
    });

    const tagInput = ref('');
    const iconPreview = ref('');
    const dragOver = ref(false);

    const validationRules = {
      shortDescription: {
        required: true,
        minLength: 10,
        maxLength: 100
      },
      fullDescription: {
        required: true,
        minLength: 50,
        maxLength: 2000
      },
      icon: {
        required: true,
        custom: value => {
          return !value ? 'Application icon is required' : '';
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

    const addTag = () => {
      const tag = tagInput.value.trim();
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        form.tags.push(tag);
        tagInput.value = '';
      }
    };

    const removeTag = index => {
      form.tags.splice(index, 1);
    };

    const onIconChange = event => {
      const file = event.target.files[0];
      if (file) {
        handleIconFile(file);
      }
    };

    const onIconDrop = event => {
      dragOver.value = false;
      const file = event.dataTransfer.files[0];
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        handleIconFile(file);
      }
    };

    const handleIconFile = file => {
      form.icon = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        iconPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);

      validateField('icon');
    };

    const removeIcon = () => {
      form.icon = null;
      iconPreview.value = '';
      validateField('icon');
    };

    const nextStep = () => {
      validateAllFields();

      if (isFormValid.value) {
        emit('update:form-data', {
          shortDescription: form.shortDescription,
          fullDescription: form.fullDescription,
          tags: form.tags,
          icon: form.icon
        });

        emit('next-step');
      }
    };

    const prevStep = () => {
      emit('update:form-data', {
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        tags: form.tags,
        icon: form.icon
      });

      emit('prev-step');
    };

    // Initialize icon preview if icon exists
    if (props.formData.icon instanceof File) {
      const reader = new FileReader();
      reader.onload = e => {
        iconPreview.value = e.target.result;
      };
      reader.readAsDataURL(props.formData.icon);
    }

    // Watch for changes in the parent formData
    watch(
      () => props.formData,
      newVal => {
        form.shortDescription = newVal.shortDescription || form.shortDescription;
        form.fullDescription = newVal.fullDescription || form.fullDescription;
        form.tags = newVal.tags || form.tags;

        if (newVal.icon !== form.icon) {
          form.icon = newVal.icon;

          if (newVal.icon instanceof File) {
            const reader = new FileReader();
            reader.onload = e => {
              iconPreview.value = e.target.result;
            };
            reader.readAsDataURL(newVal.icon);
          } else {
            iconPreview.value = '';
          }
        }
      },
      { deep: true }
    );

    return {
      form,
      errors,
      tagInput,
      iconPreview,
      dragOver,
      validateField,
      isFormValid,
      addTag,
      removeTag,
      onIconChange,
      onIconDrop,
      removeIcon,
      nextStep,
      prevStep
    };
  }
};
</script>

<style lang="scss" scoped>
.description-form {
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
    position: relative;

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

      &.textarea {
        resize: vertical;
        min-height: 120px;
      }
    }

    .character-count {
      position: absolute;
      right: 0;
      top: 0;
      font-size: 0.85rem;
      color: var(--text-tertiary);
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .help-text {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin-top: 0.5rem;
    }
  }

  .tags-input {
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;

      .tag {
        display: inline-flex;
        align-items: center;
        background: var(--bg-secondary);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        font-size: 0.9rem;

        .tag-remove {
          background: none;
          border: none;
          color: var(--text-tertiary);
          margin-left: 0.5rem;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          padding: 0;

          &:hover {
            color: var(--error-color);
          }
        }
      }
    }
  }

  .file-upload {
    .file-upload-area {
      border: 2px dashed var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover,
      &.drag-over {
        border-color: var(--accent-primary);
        background-color: rgba(var(--accent-primary-rgb), 0.05);
      }

      .file-input {
        display: none;
      }

      .upload-placeholder {
        svg {
          color: var(--text-tertiary);
          margin-bottom: 1rem;
        }

        p {
          color: var(--text-secondary);
          margin: 0;
        }
      }

      .file-preview {
        .icon-preview {
          max-width: 150px;
          max-height: 150px;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .remove-file {
          background: none;
          border: none;
          color: var(--error-color);
          text-decoration: underline;
          cursor: pointer;
          padding: 0.5rem;

          &:hover {
            text-decoration: none;
          }
        }
      }
    }
  }

  .form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
  }
}
</style>
