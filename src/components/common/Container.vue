<template>
  <div :class="['container', `container--${size}`]">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppContainer',
  props: {
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large', 'fluid'].includes(value)
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;

  &--small {
    max-width: 768px;
  }

  &--default {
    max-width: 1024px;
  }

  &--large {
    max-width: 1280px;
  }

  &--fluid {
    max-width: none;
  }

  @media (min-width: 768px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>
