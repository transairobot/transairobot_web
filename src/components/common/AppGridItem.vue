<template>
  <div
    class="app-grid-item"
    :class="[
      span ? `app-grid-item--span-${span}` : '',
      alignSelf ? `app-grid-item--align-${alignSelf}` : ''
    ]"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppGridItem',
  props: {
    span: {
      type: [Number, String],
      default: null,
      validator: value => {
        if (value === null) return true;
        const num = parseInt(value, 10);
        return !isNaN(num) && num > 0 && num <= 6;
      }
    },
    alignSelf: {
      type: String,
      default: null,
      validator: value => {
        if (value === null) return true;
        return ['start', 'center', 'end', 'stretch'].includes(value);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-grid-item {
  // Column span
  &--span-2 {
    grid-column: span 2;
  }

  &--span-3 {
    grid-column: span 3;
  }

  &--span-4 {
    grid-column: span 4;
  }

  &--span-5 {
    grid-column: span 5;
  }

  &--span-6 {
    grid-column: span 6;
  }

  // Alignment
  &--align-start {
    align-self: start;
  }

  &--align-center {
    align-self: center;
  }

  &--align-end {
    align-self: end;
  }

  &--align-stretch {
    align-self: stretch;
  }
}
</style>
