<template>
  <div class="app-review-detail">
    <div v-if="!app" class="empty-state">
      <p>Select an application to review</p>
    </div>
    <div v-else class="app-detail">
      <div class="app-header">
        <div class="app-icon">
          <img :src="app.icon" :alt="app.name + ' icon'" />
        </div>
        <div class="app-title">
          <h2>{{ app.name }}</h2>
          <p>By {{ app.developer }}</p>
          <p class="submission-date">Submitted: {{ formatDate(app.submittedDate) }}</p>
        </div>
      </div>

      <div class="app-content" v-if="appDetails">
        <div class="section">
          <h3>Description</h3>
          <p>{{ appDetails.description }}</p>
        </div>

        <div class="section">
          <h3>Features</h3>
          <ul>
            <li v-for="(feature, index) in appDetails.features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="section">
          <h3>Requirements</h3>
          <p>{{ appDetails.requirements }}</p>
        </div>

        <div class="section">
          <h3>Screenshots</h3>
          <div class="screenshots">
            <div
              v-for="(screenshot, index) in appDetails.screenshots"
              :key="index"
              class="screenshot"
            >
              <img :src="screenshot" :alt="`${app.name} screenshot ${index + 1}`" />
            </div>
          </div>
        </div>

        <div class="review-actions" v-if="!showReviewForm">
          <button class="approve" @click="showApprovalForm">Approve Application</button>
          <button class="reject" @click="showRejectionForm">Reject Application</button>
        </div>

        <div class="review-form" v-if="showReviewForm">
          <h3>{{ reviewAction === 'approve' ? 'Approve Application' : 'Reject Application' }}</h3>
          <textarea
            v-model="reviewFeedback"
            :placeholder="
              reviewAction === 'approve'
                ? 'Add any feedback for the developer (optional)'
                : 'Please provide a reason for rejection'
            "
          ></textarea>
          <div class="form-actions">
            <button class="cancel" @click="cancelReview">Cancel</button>
            <button
              class="submit"
              @click="submitReview"
              :disabled="reviewAction === 'reject' && !reviewFeedback.trim()"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'AppReviewDetail',
  props: {
    app: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      appDetails: null,
      loading: false,
      error: null,
      reviewFeedback: '',
      showReviewForm: false,
      reviewAction: null, // 'approve' or 'reject'
      processingReview: false
    };
  },
  methods: {
    ...mapActions('admin', ['approveApp', 'rejectApp']),
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    fetchAppDetails() {
      if (!this.app) return;

      this.loading = true;
      this.error = null;

      // Mock API call for now
      setTimeout(() => {
        this.appDetails = {
          id: this.app.id,
          name: this.app.name,
          developer: this.app.developer,
          description:
            'This is a detailed description of the application. It explains what the app does and how it integrates with TransAIRobot systems.',
          features: [
            'Feature 1: Integration with robot navigation',
            'Feature 2: Real-time data processing',
            'Feature 3: Custom visualization tools'
          ],
          requirements: 'TransAIRobot v2.0 or higher',
          version: '1.0.0',
          screenshots: ['/assets/screenshots/app1.jpg', '/assets/screenshots/app2.jpg']
        };
        this.loading = false;
      }, 500);
    },
    showApprovalForm() {
      this.showReviewForm = true;
      this.reviewAction = 'approve';
      this.reviewFeedback = '';
    },
    showRejectionForm() {
      this.showReviewForm = true;
      this.reviewAction = 'reject';
      this.reviewFeedback = '';
    },
    cancelReview() {
      this.showReviewForm = false;
      this.reviewAction = null;
      this.reviewFeedback = '';
    },
    async submitReview() {
      if (this.reviewAction === 'reject' && !this.reviewFeedback.trim()) {
        return; // Require feedback for rejections
      }

      this.processingReview = true;

      try {
        const reviewData = {
          feedback: this.reviewFeedback.trim() || 'No feedback provided'
        };

        let result;
        if (this.reviewAction === 'approve') {
          result = await this.approveApp({
            appId: this.app.id,
            feedback: reviewData.feedback
          });
        } else {
          result = await this.rejectApp({
            appId: this.app.id,
            feedback: reviewData.feedback
          });
        }

        if (result.success) {
          this.$emit('review-complete', {
            app: this.app,
            action: this.reviewAction,
            feedback: reviewData.feedback
          });

          // Show success notification
          this.$emit('show-notification', {
            type: 'success',
            message:
              this.reviewAction === 'approve'
                ? 'Application approved successfully'
                : 'Application rejected successfully'
          });
        }
      } catch (error) {
        this.$emit('show-notification', {
          type: 'error',
          message: `Failed to ${this.reviewAction} application: ${error.message || 'Unknown error'}`
        });
      } finally {
        this.processingReview = false;
        this.showReviewForm = false;
        this.reviewAction = null;
        this.reviewFeedback = '';
      }
    }
  },
  watch: {
    app(newVal) {
      if (newVal) {
        this.fetchAppDetails();
        this.reviewFeedback = '';
        this.showReviewForm = false;
      } else {
        this.appDetails = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-review-detail {
  height: 100%;
  padding: 1rem;
  overflow-y: auto;

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: var(--text-secondary);
  }

  .app-detail {
    .app-header {
      display: flex;
      margin-bottom: 2rem;

      .app-icon {
        width: 80px;
        height: 80px;
        margin-right: 1.5rem;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
      }

      .app-title {
        h2 {
          margin: 0 0 0.5rem 0;
        }

        p {
          margin: 0;
          color: var(--text-secondary);
        }

        .submission-date {
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
      }
    }

    .app-content {
      .section {
        margin-bottom: 2rem;

        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        ul {
          padding-left: 1.5rem;
        }
      }

      .screenshots {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        padding-bottom: 1rem;

        .screenshot {
          width: 200px;
          height: 150px;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
          }
        }
      }
    }

    .review-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;

      button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &.approve {
          background-color: var(--success);
          color: white;
          border: none;

          &:hover {
            background-color: var(--success-dark);
          }
        }

        &.reject {
          background-color: var(--danger);
          color: white;
          border: none;

          &:hover {
            background-color: var(--danger-dark);
          }
        }
      }
    }

    .review-form {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;

      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
      }

      textarea {
        width: 100%;
        min-height: 120px;
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-primary);
        color: var(--text-primary);
        resize: vertical;
        margin-bottom: 1rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;

        button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;

          &.submit {
            background-color: var(--accent-primary);
            color: white;
            border: none;

            &:hover {
              background-color: var(--accent-primary-dark, #1ccb97ff);
            }
          }

          &.cancel {
            background-color: transparent;
            border: 1px solid var(--border-color);

            &:hover {
              background-color: var(--bg-secondary);
            }
          }
        }
      }
    }
  }
}
</style>
