<template>
  <div class="file-upload-form">
    <h3 class="form-section-title">Upload Application Files</h3>
    <p class="form-section-description">Upload your WASM module and configuration files</p>

    <div class="upload-container">
      <div class="form-group">
        <label>WASM Module*</label>
        <div class="file-upload">
          <div
            class="file-upload-area"
            :class="{ 'has-file': form.wasmModule, 'drag-over': wasmDragOver }"
            @click="$refs.wasmInput.click()"
            @dragover.prevent="wasmDragOver = true"
            @dragleave.prevent="wasmDragOver = false"
            @drop.prevent="onWasmDrop"
          >
            <input
              ref="wasmInput"
              type="file"
              accept=".wasm"
              class="file-input"
              @change="onWasmChange"
            />

            <div v-if="!form.wasmModule" class="upload-placeholder">
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
              <p>Click or drag to upload WASM module (.wasm)</p>
            </div>

            <div v-else class="file-preview">
              <div class="file-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <div class="file-details">
                  <p class="file-name">{{ form.wasmModule.name }}</p>
                  <p class="file-size">{{ formatFileSize(form.wasmModule.size) }}</p>
                </div>
              </div>
              <button type="button" class="remove-file" @click.stop="removeWasmModule">
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-if="errors.wasmModule" class="error-message">{{ errors.wasmModule }}</p>
        <p class="help-text">Upload your compiled WebAssembly module</p>
      </div>

      <div class="form-group">
        <label>Configuration File*</label>
        <div class="file-upload">
          <div
            class="file-upload-area"
            :class="{ 'has-file': form.configFile, 'drag-over': configDragOver }"
            @click="$refs.configInput.click()"
            @dragover.prevent="configDragOver = true"
            @dragleave.prevent="configDragOver = false"
            @drop.prevent="onConfigDrop"
          >
            <input
              ref="configInput"
              type="file"
              accept=".json"
              class="file-input"
              @change="onConfigChange"
            />

            <div v-if="!form.configFile" class="upload-placeholder">
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
              <p>Click or drag to upload configuration file (.json)</p>
            </div>

            <div v-else class="file-preview">
              <div class="file-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <div class="file-details">
                  <p class="file-name">{{ form.configFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(form.configFile.size) }}</p>
                </div>
              </div>
              <button type="button" class="remove-file" @click.stop="removeConfigFile">
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-if="errors.configFile" class="error-message">{{ errors.configFile }}</p>
        <p class="help-text">Upload your application configuration file in JSON format</p>
      </div>
    </div>

    <div class="upload-guidelines">
      <h4>File Requirements</h4>
      <ul>
        <li>WASM module must be compiled for the TransAIRobot platform</li>
        <li>Configuration file must follow the TransAIRobot application schema</li>
        <li>Maximum file size: 10MB for WASM module, 1MB for configuration file</li>
      </ul>

      <div class="documentation-link">
        <a href="/developer/docs" target="_blank">
          View Developer Documentation
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
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
  name: 'FileUploadForm',
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
      wasmModule: props.formData.wasmModule || null,
      configFile: props.formData.configFile || null
    });

    const errors = reactive({
      wasmModule: '',
      configFile: ''
    });

    const wasmDragOver = ref(false);
    const configDragOver = ref(false);

    const validationRules = {
      wasmModule: {
        required: true,
        custom: value => {
          if (!value) return 'WASM module is required';
          if (value.size > 10 * 1024 * 1024) return 'WASM module must be less than 10MB';
          if (!value.name.endsWith('.wasm')) return 'File must be a .wasm file';
          return '';
        }
      },
      configFile: {
        required: true,
        custom: value => {
          if (!value) return 'Configuration file is required';
          if (value.size > 1024 * 1024) return 'Configuration file must be less than 1MB';
          if (!value.name.endsWith('.json')) return 'File must be a .json file';
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

    const formatFileSize = bytes => {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const onWasmChange = event => {
      const file = event.target.files[0];
      if (file) {
        form.wasmModule = file;
        validateField('wasmModule');
      }
    };

    const onWasmDrop = event => {
      wasmDragOver.value = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        form.wasmModule = file;
        validateField('wasmModule');
      }
    };

    const removeWasmModule = () => {
      form.wasmModule = null;
      validateField('wasmModule');
    };

    const onConfigChange = event => {
      const file = event.target.files[0];
      if (file) {
        form.configFile = file;
        validateField('configFile');
      }
    };

    const onConfigDrop = event => {
      configDragOver.value = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        form.configFile = file;
        validateField('configFile');
      }
    };

    const removeConfigFile = () => {
      form.configFile = null;
      validateField('configFile');
    };

    const nextStep = () => {
      validateAllFields();

      if (isFormValid.value) {
        emit('update:form-data', {
          wasmModule: form.wasmModule,
          configFile: form.configFile
        });

        emit('next-step');
      }
    };

    const prevStep = () => {
      emit('update:form-data', {
        wasmModule: form.wasmModule,
        configFile: form.configFile
      });

      emit('prev-step');
    };

    // Watch for changes in the parent formData
    watch(
      () => props.formData,
      newVal => {
        form.wasmModule = newVal.wasmModule || form.wasmModule;
        form.configFile = newVal.configFile || form.configFile;
      },
      { deep: true }
    );

    return {
      form,
      errors,
      wasmDragOver,
      configDragOver,
      validateField,
      isFormValid,
      formatFileSize,
      onWasmChange,
      onWasmDrop,
      removeWasmModule,
      onConfigChange,
      onConfigDrop,
      removeConfigFile,
      nextStep,
      prevStep
    };
  }
};
</script>

<style lang="scss" scoped>
.file-upload-form {
  .form-section-title {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .form-section-description {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .upload-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .form-group {
    position: relative;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
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

      &.has-file {
        border-style: solid;
        background-color: var(--bg-secondary);
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
        .file-info {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;

          svg {
            color: var(--accent-primary);
            margin-right: 1rem;
          }

          .file-details {
            text-align: left;

            .file-name {
              margin: 0;
              font-weight: 500;
            }

            .file-size {
              margin: 0;
              color: var(--text-tertiary);
              font-size: 0.85rem;
            }
          }
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

  .upload-guidelines {
    background-color: var(--bg-secondary);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;

    h4 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    ul {
      margin: 0;
      padding-left: 1.5rem;

      li {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
      }
    }

    .documentation-link {
      margin-top: 1.5rem;
      text-align: center;

      a {
        display: inline-flex;
        align-items: center;
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 500;

        svg {
          margin-left: 0.5rem;
        }

        &:hover {
          text-decoration: underline;
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

@media (min-width: 768px) {
  .file-upload-form {
    .upload-container {
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
