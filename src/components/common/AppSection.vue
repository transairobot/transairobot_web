<template>
  <section
    class="app-section"
    :class="[
      `app-section--${background}`,
      `app-section--${spacing}`,
      centered ? 'app-section--centered' : ''
    ]"
  >
    <AppContainer :fluid="fluid" :narrow="narrow" :padding="padding">
      <div class="app-section__content">
        <h2 v-if="title" class="app-section__title">{{ title }}</h2>
        <slot></slot>
      </div>
    </AppContainer>
  </section>
</template>

<script>
import AppContainer from './AppContainer.vue';

export default {
  name: 'AppSection',
  components: {
    AppContainer
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'secondary', 'accent', 'gradient'].includes(value)
    },
    spacing: {
      type: String,
      default: 'normal',
      validator: value => ['small', 'normal', 'large'].includes(value)
    },
    centered: {
      type: Boolean,
      default: false
    },
    fluid: {
      type: Boolean,
      default: false
    },
    narrow: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'normal'
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-section {
  width: 100%;

  &--default {
    background-color: var(--bg-primary);
  }

  &--primary {
    background-color: var(--bg-secondary);
  }

  &--secondary {
    background-color: var(--bg-tertiary, var(--bg-secondary));
  }

  &--accent {
    background-color: var(--accent-bg);
    color: var(--text-on-accent);
  }

  &--gradient {
    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
    color: var(--text-on-accent);
  }

  &--small {
    padding: $spacing-md 0;
  }

  &--normal {
    padding: $spacing-xl 0;

    @media (min-width: $breakpoint-md) {
      padding: $spacing-2xl 0;
    }
  }

  &--large {
    padding: $spacing-2xl 0;

    @media (min-width: $breakpoint-md) {
      padding: $spacing-3xl 0;
    }
  }

  &--centered {
    text-align: center;

    .app-section__content {
      margin: 0 auto;
    }
  }

  &__title {
    margin-bottom: $spacing-lg;

    @media (min-width: $breakpoint-md) {
      margin-bottom: $spacing-xl;
    }
  }
}
</style>
