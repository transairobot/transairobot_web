<template>
  <div class="app-submission-page">
    <AppHeader />
    <main>
      <AppContainer>
        <div class="submission-header">
          <h1>Submit Application</h1>
          <p class="submission-subtitle">
            Create and publish your robot application to the TransAIRobot store
          </p>
        </div>

        <div class="submission-progress">
          <div class="progress-steps">
            <div
              v-for="(step, index) in steps"
              :key="index"
              :class="[
                'progress-step',
                {
                  active: currentStep === index,
                  completed: currentStep > index
                }
              ]"
            >
              <div class="step-indicator">
                <template v-if="currentStep > index">
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
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </template>
                <template v-else>
                  {{ index + 1 }}
                </template>
              </div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>
        </div>

        <div class="submission-form">
          <AppCard variant="primary">
            <component
              :is="steps[currentStep].component"
              :form-data="formData"
              @update:form-data="updateFormData"
              @next-step="nextStep"
              @prev-step="prevStep"
              @submit-form="submitForm"
            />
          </AppCard>
        </div>
      </AppContainer>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import BasicInfoForm from '../components/developer/submission/BasicInfoForm.vue';
import DescriptionForm from '../components/developer/submission/DescriptionForm.vue';
import FileUploadForm from '../components/developer/submission/FileUploadForm.vue';
import ReviewSubmitForm from '../components/developer/submission/ReviewSubmitForm.vue';

export default {
  name: 'AppSubmissionPage',
  components: {
    AppHeader,
    AppFooter,
    AppContainer,
    AppCard,
    BasicInfoForm,
    DescriptionForm,
    FileUploadForm,
    ReviewSubmitForm
  },
  setup() {
    const router = useRouter();
    const currentStep = ref(0);

    const steps = [
      {
        label: 'Basic Info',
        component: BasicInfoForm
      },
      {
        label: 'Description',
        component: DescriptionForm
      },
      {
        label: 'File Upload',
        component: FileUploadForm
      },
      {
        label: 'Review & Submit',
        component: ReviewSubmitForm
      }
    ];

    const formData = reactive({
      name: '',
      category: [],
      shortDescription: '',
      fullDescription: '',
      icon: null,
      screenshots: [],
      wasmModule: null,
      configFile: null,
      price: 0,
      isPaid: false,
      version: '1.0.0',
      tags: []
    });

    const updateFormData = newData => {
      Object.assign(formData, newData);
    };

    const nextStep = () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
        window.scrollTo(0, 0);
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
        window.scrollTo(0, 0);
      }
    };

    const submitForm = async () => {
      try {
        // Here we would normally submit the form data to the API
        // For now, we'll just simulate a successful submission

        // Redirect to developer dashboard with success message
        router.push({
          path: '/developer',
          query: {
            submission: 'success',
            appId: 'new-app-123' // This would normally come from the API response
          }
        });
      } catch (error) {
        console.error('Error submitting application:', error);
      }
    };

    return {
      currentStep,
      steps,
      formData,
      updateFormData,
      nextStep,
      prevStep,
      submitForm
    };
  }
};
</script>

<style lang="scss" scoped>
.app-submission-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .submission-header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .submission-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
  }

  .submission-progress {
    margin-bottom: 2rem;

    .progress-steps {
      display: flex;
      justify-content: space-between;
      max-width: 800px;
      margin: 0 auto;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 15px;
        left: 40px;
        right: 40px;
        height: 2px;
        background: var(--border-color);
        z-index: 1;
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 2;
        flex: 1;

        .step-indicator {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .step-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-align: center;
          transition: all 0.3s ease;
        }

        &.active {
          .step-indicator {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border-color: var(--accent-primary);
            color: var(--text-on-accent);
            box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2);
          }

          .step-label {
            color: var(--text-primary);
            font-weight: 600;
          }
        }

        &.completed {
          .step-indicator {
            background: var(--success-color);
            border-color: var(--success-color);
            color: white;
          }
        }
      }
    }
  }

  .submission-form {
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .app-submission-page {
    .submission-progress {
      .progress-steps {
        .step-label {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>
