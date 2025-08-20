<template>
  <div class="app-grid" :class="[`app-grid--${columns}`, `app-grid--gap-${gap}`]">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppGrid',
  props: {
    columns: {
      type: [Number, String],
      default: 3,
      validator: value => {
        const num = parseInt(value, 10);
        return !isNaN(num) && num > 0 && num <= 6;
      }
    },
    gap: {
      type: String,
      default: 'normal',
      validator: value => ['none', 'small', 'normal', 'large'].includes(value)
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-grid {
  display: grid;
  width: 100%;

  // Gap variations
  &--gap-none {
    gap: 0;
  }

  &--gap-small {
    gap: $spacing-sm;
  }

  &--gap-normal {
    gap: $spacing-md;

    @media (min-width: $breakpoint-md) {
      gap: $spacing-lg;
    }
  }

  &--gap-large {
    gap: $spacing-lg;

    @media (min-width: $breakpoint-md) {
      gap: $spacing-xl;
    }
  }

  // Responsive grid columns
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }

  @media (min-width: $breakpoint-sm) and (max-width: $breakpoint-md) {
    &--1 {
      grid-template-columns: 1fr;
    }

    &--2,
    &--3,
    &--4,
    &--5,
    &--6 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: $breakpoint-md) {
    &--1 {
      grid-template-columns: 1fr;
    }

    &--2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &--4 {
      grid-template-columns: repeat(4, 1fr);
    }

    &--5 {
      grid-template-columns: repeat(5, 1fr);
    }

    &--6 {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}
</style>
