<template>
  <div class="review-submit-form">
    <h3 class="form-section-title">Review & Submit</h3>
    <p class="form-section-description">Review your application details before submission</p>

    <div class="review-sections">
      <div class="review-section">
        <h4 class="section-title">Basic Information</h4>
        <div class="review-grid">
          <div class="review-item">
            <div class="item-label">Application Name</div>
            <div class="item-value">{{ formData.name }}</div>
          </div>
          <div class="review-item">
            <div class="item-label">Version</div>
            <div class="item-value">{{ formData.version }}</div>
          </div>
          <div class="review-item">
            <div class="item-label">Category</div>
            <div class="item-value">
              <span v-for="(cat, index) in formData.category" :key="cat" class="category-tag">
                {{ getCategoryLabel(cat) }}{{ index < formData.category.length - 1 ? ', ' : '' }}
              </span>
            </div>
          </div>
          <div class="review-item">
            <div class="item-label">Pricing</div>
            <div class="item-value">
              {{ formData.isPaid ? `$${formData.price.toFixed(2)}` : 'Free' }}
            </div>
          </div>
        </div>
        <div class="section-actions">
          <AppButton @click="editSection(0)" variant="text"> Edit </AppButton>
        </div>
      </div>

      <div class="review-section">
        <h4 class="section-title">Description</h4>
        <div class="review-grid">
          <div class="review-item full-width">
            <div class="item-label">Short Description</div>
            <div class="item-value">{{ formData.shortDescription }}</div>
          </div>
          <div class="review-item full-width">
            <div class="item-label">Full Description</div>
            <div class="item-value description-text">{{ formData.fullDescription }}</div>
          </div>
          <div class="review-item">
            <div class="item-label">Tags</div>
            <div class="item-value">
              <div class="tags-list">
                <span v-for="tag in formData.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
                <span v-if="formData.tags.length === 0" class="no-tags">No tags</span>
              </div>
            </div>
          </div>
          <div class="review-item">
            <div class="item-label">Application Icon</div>
            <div class="item-value">
              <div class="icon-preview" v-if="iconPreview">
                <img :src="iconPreview" alt="Application icon" />
              </div>
              <span v-else class="no-icon">No icon uploaded</span>
            </div>
          </div>
        </div>
        <div class="section-actions">
          <AppButton @click="editSection(1)" variant="text"> Edit </AppButton>
        </div>
      </div>

      <div class="review-section">
        <h4 class="section-title">Files</h4>
        <div class="review-grid">
          <div class="review-item">
            <div class="item-label">WASM Module</div>
            <div class="item-value">
              <div class="file-info" v-if="formData.wasmModule">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>{{ formData.wasmModule.name }}</span>
                <span class="file-size">({{ formatFileSize(formData.wasmModule.size) }})</span>
              </div>
              <span v-else class="no-file">No file uploaded</span>
            </div>
          </div>
          <div class="review-item">
            <div class="item-label">Configuration File</div>
            <div class="item-value">
              <div class="file-info" v-if="formData.configFile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>{{ formData.configFile.name }}</span>
                <span class="file-size">({{ formatFileSize(formData.configFile.size) }})</span>
              </div>
              <span v-else class="no-file">No file uploaded</span>
            </div>
          </div>
        </div>
        <div class="section-actions">
          <AppButton @click="editSection(2)" variant="text"> Edit </AppButton>
        </div>
      </div>
    </div>

    <div class="submission-terms">
      <div class="terms-checkbox">
        <input id="terms-agreement" type="checkbox" v-model="termsAgreed" />
        <label for="terms-agreement">
          I agree to the
          <a href="/developer/terms" target="_blank">Developer Terms and Conditions</a> and certify
          that my application complies with all platform guidelines.
        </label>
      </div>
      <p v-if="!termsAgreed && submitAttempted" class="error-message">
        You must agree to the terms and conditions to submit your application
      </p>
    </div>

    <div class="form-actions">
      <AppButton @click="prevStep" variant="outline"> Back </AppButton>
      <AppButton
        @click="submitApplication"
        variant="primary"
        :disabled="!termsAgreed || submitting"
      >
        <span v-if="submitting">
          <svg
            class="spinner"
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
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Submitting...
        </span>
        <span v-else>Submit Application</span>
      </AppButton>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AppButton from '../../common/AppButton.vue';

export default {
  name: 'ReviewSubmitForm',
  components: {
    AppButton
  },
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  emits: ['prev-step', 'submit-form'],
  setup(props, { emit }) {
    const termsAgreed = ref(false);
    const submitAttempted = ref(false);
    const submitting = ref(false);
    const iconPreview = ref('');

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

    const getCategoryLabel = value => {
      const category = categories.find(cat => cat.value === value);
      return category ? category.label : value;
    };

    const formatFileSize = bytes => {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const editSection = () => {
      emit('prev-step');
      // Navigate to the specific section
      // This would typically be handled by the parent component
      // by setting the currentStep to the appropriate value
    };

    const prevStep = () => {
      emit('prev-step');
    };

    const submitApplication = () => {
      if (!termsAgreed.value) {
        submitAttempted.value = true;
        return;
      }

      submitting.value = true;

      // Simulate API call delay
      setTimeout(() => {
        submitting.value = false;
        emit('submit-form');
      }, 1500);
    };

    onMounted(() => {
      // Create icon preview if icon exists
      if (props.formData.icon instanceof File) {
        const reader = new FileReader();
        reader.onload = e => {
          iconPreview.value = e.target.result;
        };
        reader.readAsDataURL(props.formData.icon);
      }
    });

    return {
      termsAgreed,
      submitAttempted,
      submitting,
      iconPreview,
      getCategoryLabel,
      formatFileSize,
      editSection,
      prevStep,
      submitApplication
    };
  }
};
</script>

<style lang="scss" scoped>
.review-submit-form {
  .form-section-title {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .form-section-description {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .review-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .review-section {
    background-color: var(--bg-secondary);
    border-radius: 0.75rem;
    padding: 1.5rem;
    position: relative;

    .section-title {
      margin-top: 0;
      margin-bottom: 1.25rem;
      font-size: 1.1rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      .review-item {
        &.full-width {
          grid-column: 1 / -1;
        }

        .item-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }

        .item-value {
          font-size: 1rem;
          color: var(--text-primary);

          &.description-text {
            white-space: pre-line;
            max-height: 150px;
            overflow-y: auto;
            padding: 0.75rem;
            background-color: var(--bg-primary);
            border-radius: 0.5rem;
            font-size: 0.95rem;
          }

          .category-tag {
            display: inline-block;
          }

          .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            .tag {
              display: inline-flex;
              align-items: center;
              background: var(--bg-tertiary);
              border-radius: 1rem;
              padding: 0.25rem 0.75rem;
              font-size: 0.9rem;
            }

            .no-tags {
              color: var(--text-tertiary);
              font-style: italic;
            }
          }

          .icon-preview {
            width: 64px;
            height: 64px;
            border-radius: 0.5rem;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .no-icon,
          .no-file {
            color: var(--text-tertiary);
            font-style: italic;
          }

          .file-info {
            display: flex;
            align-items: center;

            svg {
              margin-right: 0.5rem;
              color: var(--accent-primary);
            }

            .file-size {
              margin-left: 0.5rem;
              color: var(--text-tertiary);
              font-size: 0.85rem;
            }
          }
        }
      }
    }

    .section-actions {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
    }
  }

  .submission-terms {
    margin-bottom: 2rem;

    .terms-checkbox {
      display: flex;
      align-items: flex-start;

      input[type='checkbox'] {
        margin-right: 0.75rem;
        margin-top: 0.25rem;
      }

      label {
        font-size: 0.95rem;

        a {
          color: var(--accent-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      margin-left: 1.75rem;
    }
  }

  .form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
  }

  .spinner {
    animation: spin 1.5s linear infinite;
    margin-right: 0.5rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .review-submit-form {
    .review-section {
      .review-grid {
        grid-template-columns: 1fr;
      }

      .section-actions {
        position: relative;
        top: auto;
        right: auto;
        margin-top: 1rem;
        text-align: right;
      }
    }
  }
}
</style>
