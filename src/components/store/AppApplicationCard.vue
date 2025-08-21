<template>
  <AppCard hoverable class="app-application-card" @click="navigateToDetail">
    <div class="app-application-card__content">
      <div class="app-application-card__icon">
        <img :src="application.iconUrl" :alt="`${application.name} icon`" />
        <div class="app-application-card__icon-overlay">
          <span class="app-application-card__view-details">View Details</span>
        </div>
      </div>
      <div class="app-application-card__info">
        <h3 class="app-application-card__name">{{ application.name }}</h3>
        <p class="app-application-card__description">
          {{ truncateDescription(application.description) }}
        </p>
        <div class="app-application-card__meta">
          <div class="app-application-card__rating" v-if="application.rating">
            <span class="app-application-card__stars">
              <span
                v-for="i in 5"
                :key="i"
                class="app-application-card__star"
                :class="{
                  'app-application-card__star--filled': i <= Math.round(application.rating)
                }"
              >
                ★
              </span>
            </span>
            <span class="app-application-card__rating-value">{{
              application.rating.toFixed(1)
            }}</span>
          </div>
          <div class="app-application-card__downloads">
            <span class="app-application-card__downloads-icon">↓</span>
            <span class="app-application-card__downloads-count">
              {{ application.downloads ? formatDownloads(application.downloads) : 'N/A' }}
            </span>
          </div>
        </div>
        <div class="app-application-card__category-tags">
          <span
            v-for="(category, index) in displayCategories"
            :key="index"
            class="app-application-card__category-tag"
          >
            {{ category }}
          </span>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script>
import AppCard from '../common/AppCard.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

export default {
  name: 'AppApplicationCard',
  components: {
    AppCard
  },
  props: {
    application: {
      type: Object,
      required: true,
      validator: app => {
        return app.id && app.name && app.description && app.iconUrl;
      }
    }
  },
  setup(props) {
    const router = useRouter();

    const truncateDescription = description => {
      if (description.length <= 100) return description;
      return description.substring(0, 97) + '...';
    };

    const formatDownloads = downloads => {
      if (downloads >= 1000000) {
        return (downloads / 1000000).toFixed(1) + 'M';
      } else if (downloads >= 1000) {
        return (downloads / 1000).toFixed(1) + 'K';
      }
      return downloads.toString();
    };

    const navigateToDetail = () => {
      router.push(`/app/${props.application.id}`);
    };

    // Display category for the application
    const displayCategories = computed(() => {
      if (!props.application.category) {
        return [];
      }
      // Handle both string and array categories
      if (Array.isArray(props.application.category)) {
        return props.application.category.slice(0, 2);
      }
      return [props.application.category];
    });

    return {
      truncateDescription,
      formatDownloads,
      navigateToDetail,
      displayCategories
    };
  }
};
</script>

<style lang="scss" scoped>
.app-application-card {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;

  &__content {
    display: flex;
    gap: 1rem;
  }

  &__icon {
    position: relative;
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.7), rgba(138, 43, 226, 0.7));
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 12px;
    }
  }

  &__view-details {
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    padding: 0.25rem;
    transform: translateY(10px);
    transition: transform 0.3s ease;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  &__description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    line-height: 1.4;
    flex: 1;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__stars {
    display: flex;
  }

  &__star {
    color: var(--text-tertiary);
    transition: transform 0.2s ease;

    &--filled {
      color: var(--accent-primary);
    }
  }

  &__rating-value {
    color: var(--text-secondary);
    margin-left: 0.25rem;
  }

  &__downloads {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--text-secondary);
  }

  &__downloads-icon {
    font-size: 0.875rem;
    transition: transform 0.3s ease;
  }

  &__category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  &__category-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 1rem;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);

    .app-application-card__name {
      color: var(--accent-primary);
    }

    .app-application-card__icon {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

      img {
        transform: scale(1.1);
      }

      &-overlay {
        opacity: 1;
      }
    }

    .app-application-card__view-details {
      transform: translateY(0);
    }

    .app-application-card__star {
      &--filled {
        transform: scale(1.2);
      }
    }

    .app-application-card__downloads-icon {
      transform: translateY(-2px);
    }

    .app-application-card__category-tag {
      background-color: var(--accent-primary);
      color: white;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .app-application-card {
    &__content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    &__icon {
      margin-bottom: 0.5rem;
      width: 80px;
      height: 80px;
    }

    &__meta {
      justify-content: center;
      gap: 1rem;
    }

    &__category-tags {
      justify-content: center;
    }
  }
}
</style>
