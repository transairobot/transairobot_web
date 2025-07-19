<template>
  <div class="app-feedback">
    <div class="feedback-header">
      <h3>User Feedback</h3>
      <div class="filter-options">
        <select v-model="ratingFilter" class="filter-select">
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <LoadingState message="Loading feedback..." />
    </div>

    <div v-else-if="filteredFeedback.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h4>No Feedback Yet</h4>
      <p>There's no feedback matching your current filter.</p>
    </div>
    <div v-else class="feedback-list">
      <div v-for="item in filteredFeedback" :key="item.id" class="feedback-item">
        <div class="feedback-header">
          <div class="user-info">
            <div class="user-avatar">{{ item.userName.charAt(0) }}</div>
            <div class="user-name">{{ item.userName }}</div>
          </div>
          <div class="feedback-meta">
            <div class="rating" :title="`${item.rating} stars`">
              {{ getRatingStars(item.rating) }}
            </div>
            <div class="date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
        <div class="feedback-content">
          <p>{{ item.comment }}</p>
        </div>
        <div class="feedback-footer">
          <div class="robot-model">
            <span class="label">Robot Model:</span>
            <span class="value">{{ item.robotModel }}</span>
          </div>
          <div class="helpful-count">
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
              <path
                d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
              ></path>
            </svg>
            {{ item.helpful }} found helpful
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import LoadingState from '../common/LoadingState.vue';
import developerService from '../../services/developer.service';

export default {
  name: 'AppFeedback',
  components: {
    LoadingState
  },
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const loading = ref(true);
    const ratingFilter = ref('all');
    const feedback = ref([]);

    const filteredFeedback = computed(() => {
      if (ratingFilter.value === 'all') {
        return feedback.value;
      }
      return feedback.value.filter(item => item.rating === parseInt(ratingFilter.value));
    });

    const fetchFeedback = async () => {
      loading.value = true;
      try {
        // In a real implementation, this would call the API
        // const response = await developerService.getAppFeedback(props.appId);

        // Mock data for demonstration
        setTimeout(() => {
          // Simulate API response
          const mockFeedback = [
            {
              id: '1',
              userName: 'John D.',
              rating: 5,
              comment:
                "This app has significantly improved my robot's navigation capabilities. Highly recommended!",
              date: '2025-07-10T14:30:00Z',
              robotModel: 'TR-2000',
              helpful: 12
            },
            {
              id: '2',
              userName: 'Sarah M.',
              rating: 4,
              comment:
                'Works great most of the time. Occasionally has issues with complex environments.',
              date: '2025-07-08T09:15:00Z',
              robotModel: 'TR-1500',
              helpful: 5
            },
            {
              id: '3',
              userName: 'Michael P.',
              rating: 5,
              comment:
                'Perfect integration with my TransAIRobot. Setup was easy and performance is excellent.',
              date: '2025-07-05T16:45:00Z',
              robotModel: 'TR-2000',
              helpful: 8
            },
            {
              id: '4',
              userName: 'Lisa K.',
              rating: 3,
              comment:
                'Good functionality but the interface could be more intuitive. Had some trouble with initial setup.',
              date: '2025-07-01T11:20:00Z',
              robotModel: 'TR-1000',
              helpful: 3
            },
            {
              id: '5',
              userName: 'Robert T.',
              rating: 2,
              comment: 'Crashes frequently on my older robot model. Needs better compatibility.',
              date: '2025-06-28T13:10:00Z',
              robotModel: 'TR-800',
              helpful: 7
            }
          ];

          feedback.value = mockFeedback;
          loading.value = false;
        }, 800);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        loading.value = false;
      }
    };

    const formatDate = dateString => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getRatingStars = rating => {
      return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    // Watch for changes in appId
    watch(
      () => props.appId,
      () => {
        fetchFeedback();
      }
    );

    onMounted(() => {
      fetchFeedback();
    });

    return {
      loading,
      ratingFilter,
      feedback,
      filteredFeedback,
      formatDate,
      getRatingStars
    };
  }
};
</script>

<style lang="scss" scoped>
.app-feedback {
  margin-bottom: 2rem;

  .feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 0;

    .empty-icon {
      margin-bottom: 1rem;
      color: var(--text-tertiary);
    }

    h4 {
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--text-secondary);
    }
  }

  .feedback-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .feedback-item {
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .user-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
          }

          .user-name {
            font-weight: 600;
          }
        }

        .feedback-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;

          .rating {
            color: var(--warning-color);
            font-size: 1.1rem;
            letter-spacing: 0.1rem;
          }

          .date {
            color: var(--text-tertiary);
            font-size: 0.8rem;
          }
        }
      }

      .feedback-content {
        margin-bottom: 1rem;

        p {
          margin: 0;
          line-height: 1.5;
        }
      }

      .feedback-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-secondary);
        font-size: 0.9rem;

        .robot-model {
          .label {
            font-weight: 500;
            margin-right: 0.25rem;
          }
        }

        .helpful-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          svg {
            color: var(--text-tertiary);
          }
        }
      }
    }
  }
}
</style>
