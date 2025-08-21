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
                  <div class="app-detail-author">
                    <span class="meta-label">Author:</span>
                    <span class="meta-value">{{ app.author }}</span>
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

                <div class="app-detail-categories" v-if="app.category && app.category.length > 0">
                  <span
                    v-for="categoryName in app.category"
                    :key="categoryName"
                    class="app-detail-category-tag"
                  >
                    {{ categoryName }}
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

            <div v-else-if="activeTab === 'screenshots'" class="app-detail-screenshots">
              <div class="screenshots-header">
                <h2>Screenshots</h2>
              </div>

              <div v-if="screenshotsLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading screenshots...</p>
              </div>

              <div v-else-if="screenshotsError" class="error-state">
                <p>Failed to load screenshots</p>
                <button @click="loadScreenshots" class="retry-btn">Retry</button>
              </div>

              <div v-else-if="screenshots.length === 0" class="empty-state">
                <p>No screenshots available for this application</p>
              </div>

              <div v-else class="screenshots-grid">
                <div
                  v-for="(screenshot, index) in screenshots"
                  :key="screenshot.id || index"
                  class="screenshot-item"
                  @click="openScreenshotModal(index)"
                >
                  <img
                    :src="screenshot.imageUrl || screenshot.uri || screenshot.url"
                    :alt="screenshot.caption || `Screenshot ${index + 1}`"
                    class="screenshot-image"
                  />
                  <div v-if="screenshot.caption" class="screenshot-caption">
                    {{ screenshot.caption }}
                  </div>
                </div>
              </div>

              <!-- Screenshot Modal -->
              <div
                v-if="showScreenshotModal"
                class="screenshot-modal"
                @click="closeScreenshotModal"
              >
                <div class="modal-content" @click.stop>
                  <button class="close-btn" @click="closeScreenshotModal">×</button>
                  <div class="modal-navigation">
                    <button
                      class="nav-btn prev-btn"
                      @click.stop="previousScreenshot"
                      :disabled="currentScreenshotIndex === 0"
                    >
                      ‹
                    </button>
                    <img
                      :src="
                        screenshots[currentScreenshotIndex]?.imageUrl ||
                        screenshots[currentScreenshotIndex]?.uri ||
                        screenshots[currentScreenshotIndex]?.url
                      "
                      :alt="
                        screenshots[currentScreenshotIndex]?.caption ||
                        `Screenshot ${currentScreenshotIndex + 1}`
                      "
                      class="modal-screenshot"
                    />
                    <button
                      class="nav-btn next-btn"
                      @click.stop="nextScreenshot"
                      :disabled="currentScreenshotIndex >= (screenshots?.length || 0) - 1"
                    >
                      ›
                    </button>
                  </div>
                  <div v-if="screenshots[currentScreenshotIndex]?.caption" class="modal-caption">
                    {{ screenshots[currentScreenshotIndex].caption }}
                  </div>
                  <div class="modal-counter">
                    {{ currentScreenshotIndex + 1 }} / {{ screenshots.length }}
                  </div>
                </div>
              </div>
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
                  :show-no-more="false"
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
  { id: 'screenshots', name: 'Screenshots' },
  { id: 'reviews', name: 'Reviews' },
  { id: 'related', name: 'Related Apps' }
];

// 认证状态
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

// 安装模态框状态
const showInstallModal = ref(false);

// 评价表单状态
const newReview = ref({
  rating: 0,
  comment: ''
});
const submittingReview = ref(false);

// 无限滚动评价引用
const reviewsScrollRef = ref();

// Screenshots相关状态
const screenshots = ref([]);
const screenshotsLoading = ref(false);
const screenshotsError = ref(null);
const showScreenshotModal = ref(false);
const currentScreenshotIndex = ref(0);

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
  router.push('/app-store');
};

// 分享应用
const shareApp = () => {
  // 复制当前页面 URL 到剪贴板
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      notificationService.success('链接已复制到剪贴板！');
    })
    .catch(err => {
      console.error('Failed to copy link:', err);
      notificationService.error('复制链接失败');
    });
};

// 安装应用
const installApp = () => {
  showInstallModal.value = true;
};

// 处理安装完成
const handleInstallationComplete = (result: any) => {
  if (result.success) {
    notificationService.success(`成功在机器人 ${result.robotId} 上安装了 ${app.value?.name}`);
  } else {
    console.error('Installation failed:', result.error);
    notificationService.error('安装失败');
  }
};

// Screenshots相关方法
const loadScreenshots = async () => {
  if (!appId.value) return;

  screenshotsLoading.value = true;
  screenshotsError.value = null;

  try {
    const result = await applicationStoreService.getApplicationScreenshots(appId.value);

    // 处理不同的数据格式
    let screenshotsData = [];

    if (Array.isArray(result)) {
      // 如果直接是数组
      screenshotsData = result;
    } else if (result && result.data && Array.isArray(result.data)) {
      // 如果是 {code, message, data} 格式
      screenshotsData = result.data;
    } else if (result && typeof result === 'object') {
      // 如果是类似数组的对象 {0: {...}, 1: {...}}
      screenshotsData = Object.values(result);
    }

    screenshots.value = screenshotsData;
  } catch (error) {
    console.error('Failed to load screenshots:', error);
    screenshotsError.value = error;
    screenshots.value = [];
  } finally {
    screenshotsLoading.value = false;
  }
};

const openScreenshotModal = (index: number) => {
  currentScreenshotIndex.value = index;
  showScreenshotModal.value = true;
};

const closeScreenshotModal = () => {
  showScreenshotModal.value = false;
};

const nextScreenshot = () => {
  const totalScreenshots = screenshots.value?.length || 0;
  if (currentScreenshotIndex.value < totalScreenshots - 1) {
    currentScreenshotIndex.value++;
  }
};

const previousScreenshot = () => {
  if (currentScreenshotIndex.value > 0) {
    currentScreenshotIndex.value--;
  }
};

// 键盘导航支持
const handleKeydown = (event: KeyboardEvent) => {
  if (!showScreenshotModal.value) return;

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      previousScreenshot();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextScreenshot();
      break;
    case 'Escape':
      event.preventDefault();
      closeScreenshotModal();
      break;
  }
};

// 监听键盘事件
watch(showScreenshotModal, isOpen => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 切换标签页
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;

  // 如果切换到评价标签且还没有加载过评价，则开始加载
  if (tabId === 'reviews' && reviews.value.length === 0 && !reviewsLoading.value) {
    refreshReviews();
  }

  // 如果切换到截图标签且还没有加载过截图，则开始加载
  if (tabId === 'screenshots' && screenshots.value.length === 0 && !screenshotsLoading.value) {
    loadScreenshots();
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

  .app-detail-screenshots {
    .screenshots-header {
      margin-bottom: 2rem;

      h2 {
        margin: 0;
        color: var(--color-text-primary);
      }
    }

    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-secondary);

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border);
        border-top: 3px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      .retry-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: var(--color-primary-dark);
        }
      }
    }

    .screenshots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;

      .screenshot-item {
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        background: var(--color-surface);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .screenshot-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .screenshot-caption {
          padding: 1rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          background: var(--color-surface);
        }
      }
    }

    .screenshot-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;

      .modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;

        .close-btn {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          z-index: 1001;

          &:hover {
            opacity: 0.7;
          }
        }

        .modal-navigation {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;

          .modal-screenshot {
            max-width: 80vw;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 8px;
          }

          .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;

            &:hover:not(:disabled) {
              background: rgba(255, 255, 255, 0.3);
            }

            &:disabled {
              opacity: 0.3;
              cursor: not-allowed;
            }

            &.prev-btn {
              left: -70px;
            }

            &.next-btn {
              right: -70px;
            }
          }
        }

        .modal-caption {
          margin-top: 1rem;
          color: white;
          text-align: center;
          font-size: 1rem;
        }

        .modal-counter {
          margin-top: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }
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
      background: var(--card-bg);
      border: 1px solid var(--divider);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);

      h3 {
        margin: 0 0 1.5rem 0;
        color: var(--text-primary);
        font-size: 1.25rem;
        font-weight: 600;
      }

      .form-group {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .rating-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;

          .rating-star {
            background: none;
            border: none;
            font-size: 1.75rem;
            color: var(--divider);
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0.25rem;
            border-radius: 4px;

            &:hover {
              color: #ffd700;
              background: rgba(255, 215, 0, 0.1);
              transform: scale(1.1);
            }

            &.active {
              color: #ffd700;
            }
          }
        }

        .form-control {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--input-border);
          border-radius: 8px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
          }

          &::placeholder {
            color: var(--text-secondary);
            opacity: 0.8;
          }

          &:hover {
            border-color: var(--accent-primary);
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;

        .submit-button {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: var(--button-text);
          border: none;
          border-radius: 8px;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(var(--accent-primary-rgb), 0.3);
          }

          &:active {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%);
            transform-origin: 50% 50%;
          }

          &:focus:not(:active)::after {
            animation: ripple 1s ease-out;
          }
        }
      }

      // 登录提示样式
      .login-prompt {
        text-align: center;
        padding: 2rem;
        background: var(--bg-secondary);
        border: 2px dashed var(--divider);
        border-radius: 12px;
        color: var(--text-secondary);

        p {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
        }

        a {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;

          &:hover {
            color: var(--accent-secondary);
            text-decoration: underline;
          }
        }
      }
    }

    // CSS 动画
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 1;
      }
      20% {
        transform: scale(25, 25);
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: scale(40, 40);
      }
    }

    @keyframes gradient-shift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .reviews-list {
      .reviews-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .review-item {
          background: var(--card-bg);
          border: 1px solid var(--divider);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          transition: all 0.3s ease;

          &:hover {
            box-shadow: var(--card-hover-shadow);
            transform: translateY(-2px);
          }

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
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                color: var(--button-text);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.875rem;
                border: 2px solid var(--divider);
              }

              .user-info {
                .user-name {
                  font-weight: 600;
                  color: var(--text-primary);
                  margin-bottom: 0.25rem;
                  font-size: 0.875rem;
                }

                .review-date {
                  font-size: 0.75rem;
                  color: var(--text-secondary);
                }
              }
            }

            .review-rating {
              display: flex;
              gap: 0.25rem;

              .star {
                font-size: 1rem;
                color: var(--divider);
                transition: color 0.2s ease;

                &.star--filled {
                  color: #ffd700;
                }
              }
            }
          }

          .review-content {
            .review-comment,
            p {
              color: var(--text-primary);
              line-height: 1.6;
              font-size: 0.875rem;
              margin: 0;
            }
          }
        }
      }
    }
  }
}
</style>
