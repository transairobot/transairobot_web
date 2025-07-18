<template>
  <div
    class="app-container"
    :class="[
      fluid ? 'app-container--fluid' : '',
      narrow ? 'app-container--narrow' : '',
      `app-container--${padding}`
    ]"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppContainer',
  props: {
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
      default: 'normal',
      validator: value => ['none', 'small', 'normal', 'large'].includes(value)
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;

  &--fluid {
    max-width: none;
  }

  &--narrow {
    max-width: 800px;
  }

  &--none {
    padding: 0;
  }

  &--small {
    padding: 0 $spacing-sm;
  }

  &--normal {
    padding: 0 $spacing-md;

    @media (min-width: $breakpoint-md) {
      padding: 0 $spacing-lg;
    }
  }

  &--large {
    padding: 0 $spacing-lg;

    @media (min-width: $breakpoint-md) {
      padding: 0 $spacing-xl;
    }
  }
}
</style>
