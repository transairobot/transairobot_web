<template>
  <div class="app-detail-page">
    <AppHeader />
    <main>
      <div class="container">
        <div v-if="loading" class="app-detail-loading">
          <LoadingState message="Loading application details..." />
        </div>

        <div v-else-if="error" class="app-detail-error">
          <ErrorState message="Failed to load application details" :retry="fetchAppDetails" />
        </div>

        <template v-else-if="app">
          <div class="app-detail-header">
            <div class="app-detail-back">
              <button class="back-button" @click="goBack">
                <span class="back-icon">←</span>
                <span>Back to Store</span>
              </button>
            </div>

            <div class="app-detail-main">
              <div class="app-detail-icon">
                <img :src="app.iconUrl" :alt="`${app.name} icon`" />
              </div>

              <div class="app-detail-info">
                <h1 class="app-detail-name">{{ app.name }}</h1>

                <div class="app-detail-meta">
                  <div class="app-detail-developer">
                    <span class="meta-label">Developer:</span>
                    <span class="meta-value">{{ app.developerId }}</span>
                  </div>

                  <div class="app-detail-version">
                    <span class="meta-label">Version:</span>
                    <span class="meta-value">{{ app.version }}</span>
                  </div>

                  <div class="app-detail-rating" v-if="app.rating">
                    <span class="app-detail-stars">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="app-detail-star"
                        :class="{ 'app-detail-star--filled': i <= Math.round(app.rating) }"
                      >
                        ★
                      </span>
                    </span>
                    <span class="app-detail-rating-value">{{ app.rating.toFixed(1) }}</span>
                  </div>
                </div>

                <div class="app-detail-categories" v-if="app.category">
                  <span class="app-detail-category-tag">
                    {{ app.category }}
                  </span>
                </div>

                <div class="app-detail-actions">
                  <button class="app-detail-install-btn" @click="installApp">
                    Install Application
                  </button>

                  <button class="app-detail-share-btn" @click="shareApp">Share</button>
                </div>
              </div>
            </div>
          </div>

          <div class="app-detail-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="setActiveTab(tab.id)"
            >
              {{ tab.name }}
            </button>
          </div>

          <div class="app-detail-content">
            <div v-if="activeTab === 'description'" class="app-detail-description">
              <div class="markdown-content" v-html="renderedDescription"></div>
            </div>

            <div v-else-if="activeTab === 'reviews'" class="app-detail-reviews">
              <div class="reviews-header">
                <h2>Reviews</h2>
                <div class="reviews-summary" v-if="app.rating">
                  <div class="rating-overview">
                    <div class="rating-score">{{ app.rating.toFixed(1) }}</div>
                    <div class="rating-stars">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="star"
                        :class="{ 'star--filled': i <= Math.round(app.rating) }"
                      >
                        ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 评价提交表单 -->
              <div class="review-form" v-if="isAuthenticated">
                <h3>Write a Review</h3>
                <form @submit.prevent="submitReview">
                  <div class="form-group">
                    <label>Rating</label>
                    <div class="rating-input">
                      <button
                        v-for="i in 5"
                        :key="i"
                        type="button"
                        class="rating-star"
                        :class="{ active: i <= newReview.rating }"
                        @click="newReview.rating = i"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="review-comment">Comment</label>
                    <textarea
                      id="review-comment"
                      v-model="newReview.comment"
                      placeholder="Share your experience with this application..."
                      rows="4"
                      class="form-control"
                    ></textarea>
                  </div>
                  <div class="form-actions">
                    <button
                      type="submit"
                      class="submit-button"
                      :disabled="!newReview.rating || !newReview.comment.trim() || submittingReview"
                    >
                      {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                    </button>
                  </div>
                </form>
              </div>

              <div v-else class="login-prompt">
                <p>Please <router-link to="/login">login</router-link> to write a review.</p>
              </div>

              <!-- 无限滚动评价列表 -->
              <div class="reviews-list">
                <InfiniteScrollList
                  :items="reviews"
                  :loading="reviewsLoading"
                  :has-more="reviewsHasMore"
                  :error="reviewsError"
                  :is-empty="reviewsIsEmpty"
                  :is-initial-loading="reviewsIsInitialLoading"
                  loading-text="Loading reviews..."
                  empty-title="No Reviews"
                  empty-description="No reviews for this application yet"
                  no-more-text="已加载全部评价"
                  @refresh="refreshReviews"
                  @load-more="loadMoreReviews"
                  ref="reviewsScrollRef"
                >
                  <template #items="{ items }">
                    <div class="reviews-container">
                      <div v-for="review in items" :key="review.id" class="review-item">
                        <div class="review-header">
                          <div class="review-user">
                            <div class="user-avatar">
                              {{ review.userId.charAt(0).toUpperCase() }}
                            </div>
                            <div class="user-info">
                              <div class="user-name">User {{ review.userId.slice(-4) }}</div>
                              <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                            </div>
                          </div>
                          <div class="review-rating">
                            <span
                              v-for="i in 5"
                              :key="i"
                              class="star"
                              :class="{ 'star--filled': i <= review.rating }"
                            >
                              ★
                            </span>
                          </div>
                        </div>
                        <div class="review-content">
                          <p>{{ review.comment }}</p>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template #empty-icon>
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                      <rect x="2" y="9" width="20" height="11" rx="2" ry="2" />
                      <circle cx="12" cy="15" r="1" />
                    </svg>
                  </template>
                </InfiniteScrollList>
              </div>
            </div>

            <div v-else-if="activeTab === 'related'" class="app-detail-related">
              <h2>Related Applications</h2>
              <p>Related applications coming soon...</p>
            </div>
          </div>
        </template>
      </div>
    </main>
    <AppFooter />

    <!-- Installation Modal -->
    <InstallationModal
      v-model:show="showInstallModal"
      :app="app"
      @installation-complete="handleInstallationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppHeader from '../components/common/AppHeader.vue';
import AppFooter from '../components/common/AppFooter.vue';
import LoadingState from '../components/common/LoadingState.vue';
import ErrorState from '../components/common/ErrorState.vue';
import InfiniteScrollList from '../components/InfiniteScrollList.vue';
import InstallationModal from '../components/robots/InstallationModal.vue';
import { useInfiniteScroll } from '../composables/useInfiniteScroll';
import applicationStoreService from '../services/application-store.service';
import authService from '../services/auth.service';
import notificationService from '../services/notification.service';
import { renderMarkdown } from '../utils/markdown';
import type { Application, Review } from '../services/application-store.service';

const route = useRoute();
const router = useRouter();
const store = useStore();

// 应用基本信息
const appId = computed(() => route.params.id as string);
const loading = computed(() => store.getters['apps/isLoading']);
const app = computed(() => store.getters['apps/currentApp'] as Application | null);
const error = computed(() => store.state.apps.error);

// 标签页状态
const activeTab = ref('description');
const tabs = [
  { id: 'description', name: 'Description' },
  { id: 'reviews', name: 'Reviews' },
  { id: 'related', name: 'Related Apps' }
];

// 认证状态
const isAuthenticated = computed(() => authService.isAuthenticated());

// 评价表单状态
const newReview = ref({
  rating: 0,
  comment: ''
});
const submittingReview = ref(false);

// 无限滚动评价引用
const reviewsScrollRef = ref();

// 使用无限滚动组合式函数获取评价
const {
  items: reviews,
  loading: reviewsLoading,
  hasMore: reviewsHasMore,
  error: reviewsError,
  isEmpty: reviewsIsEmpty,
  isInitialLoading: reviewsIsInitialLoading,
  refresh: refreshReviews,
  loadMore: loadMoreReviews,
  setSentinel: setReviewsSentinel
} = useInfiniteScroll<Review>(
  params => applicationStoreService.getApplicationReviewsInfinite(appId.value, params),
  { immediate: false } // 不立即加载，等切换到评价标签时再加载
);

// 渲染的描述内容
const renderedDescription = computed(() => {
  if (!app.value || !app.value.description) return '';
  return renderMarkdown(app.value.description);
});

// 获取应用详情
const fetchAppDetails = async () => {
  try {
    await store.dispatch('apps/fetchAppDetails', appId.value);
  } catch (err) {
    console.error('Failed to fetch app details:', err);
  }
};

// 提交评价
const submitReview = async () => {
  if (!newReview.value.rating || !newReview.value.comment.trim()) {
    notificationService.error('请填写评分和评价内容');
    return;
  }

  submittingReview.value = true;
  try {
    await applicationStoreService.submitReview(appId.value, {
      rating: newReview.value.rating,
      comment: newReview.value.comment.trim()
    });

    notificationService.success('评价提交成功');

    // 重置表单
    newReview.value = {
      rating: 0,
      comment: ''
    };

    // 刷新评价列表
    await refreshReviews();
  } catch (error) {
    console.error('Failed to submit review:', error);
    notificationService.error('评价提交失败');
  } finally {
    submittingReview.value = false;
  }
};

// 格式化日期
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 返回上一页
const goBack = () => {
  router.push('/store');
};

// 切换标签页
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;

  // 如果切换到评价标签且还没有加载过评价，则开始加载
  if (tabId === 'reviews' && reviews.value.length === 0 && !reviewsLoading.value) {
    refreshReviews();
  }
};

// 监听评价滚动引用变化
watch(reviewsScrollRef, newRef => {
  if (newRef?.sentinelElement) {
    nextTick(() => {
      setReviewsSentinel(newRef.sentinelElement);
    });
  }
});

// 组件挂载时获取应用详情
onMounted(() => {
  fetchAppDetails();
});
</script>

<style lang="scss" scoped>
.app-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    padding: 2rem 0;
  }

  .app-detail-loading,
  .app-detail-error {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .app-detail-back {
    margin-bottom: 1.5rem;

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--accent-primary);
      }

      .back-icon {
        font-size: 1.25rem;
      }
    }
  }

  .app-detail-main {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .app-detail-icon {
    flex-shrink: 0;
    width: 128px;
    height: 128px;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .app-detail-info {
    flex: 1;
  }

  .app-detail-name {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .app-detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;

    .meta-label {
      color: var(--text-tertiary);
      margin-right: 0.25rem;
    }

    .meta-value {
      color: var(--text-secondary);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .app-detail-stars {
    display: flex;
  }

  .app-detail-star {
    color: var(--text-tertiary);

    &--filled {
      color: var(--accent-primary);
    }
  }

  .app-detail-rating-value {
    font-weight: 600;
    color: var(--text-primary);
  }

  .app-detail-downloads {
    color: var(--text-tertiary);
  }

  .app-detail-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-category-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 1rem;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--accent-primary);
      color: white;
    }
  }

  .app-detail-actions {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .app-detail-install-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
      // background-color: var(--accent-primary-dark, #1ccb97ff);
      background-color: var(--accent-primary-dark, #1ccb97ff);
      transform: translateY(-2px);
    }
  }

  .app-detail-share-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }

  .app-detail-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2rem;

    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        color: var(--accent-primary);
        border-bottom-color: var(--accent-primary);
      }
    }

    @media (max-width: 768px) {
      justify-content: center;
      flex-wrap: wrap;

      .tab-button {
        flex: 1;
        min-width: 120px;
        text-align: center;
      }
    }
  }

  .app-detail-content {
    margin-bottom: 3rem;
  }

  .app-detail-description {
    line-height: 1.6;
    color: var(--text-secondary);

    :deep(h1),
    :deep(h2),
    :deep(h3) {
      color: var(--text-primary);
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    :deep(p) {
      margin-bottom: 1rem;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :deep(li) {
      margin-bottom: 0.5rem;
    }

    :deep(a) {
      color: var(--accent-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(code) {
      background-color: var(--bg-secondary);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }

    :deep(pre) {
      background-color: var(--bg-secondary);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1.5rem;

      code {
        background: none;
        padding: 0;
      }
    }
  }

  .app-detail-reviews {
    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        margin: 0;
        color: var(--color-text-primary);
      }

      .reviews-summary {
        .rating-overview {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .rating-score {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-primary);
          }

          .rating-stars {
            .star {
              color: #ffd700;
              font-size: 1.25rem;

              &:not(.star--filled) {
                color: var(--color-border);
              }
            }
          }
        }
      }
    }

    .review-form {
      background: var(--color-background-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;

      h3 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
        font-size: 1.125rem;
      }

      .form-group {
        margin-bottom: 1rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .rating-input {
          display: flex;
          gap: 0.25rem;

          .rating-star {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--color-border);
            cursor: pointer;
            transition: color 0.2s;

            &:hover,
            &.active {
              color: #ffd700;
            }
          }
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-background);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 100px;

          &:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          &::placeholder {
            color: var(--color-text-tertiary);
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;

        .submit-button {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover:not(:disabled) {
            background: var(--color-primary-dark);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .login-prompt {
      background: var(--color-background-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;

      p {
        margin: 0;
        color: var(--color-text-secondary);

        a {
          color: var(--color-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .reviews-list {
      .reviews-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .review-item {
          background: var(--color-background-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--color-border);

          .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;

            .review-user {
              display: flex;
              align-items: center;
              gap: 0.75rem;

              .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--color-primary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.875rem;
              }

              .user-info {
                .user-name {
                  font-weight: 500;
                  color: var(--color-text-primary);
                  margin-bottom: 0.25rem;
                }

                .review-date {
                  font-size: 0.75rem;
                  color: var(--color-text-tertiary);
                }
              }
            }

            .review-rating {
              .star {
                color: #ffd700;
                font-size: 1rem;

                &:not(.star--filled) {
                  color: var(--color-border);
                }
              }
            }
          }

          .review-content {
            p {
              margin: 0;
              color: var(--color-text-secondary);
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}
</style>
