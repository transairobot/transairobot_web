<template>
  <div class="container" :class="{ 'container--narrow': narrow }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppContainer',
  props: {
    narrow: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;

  &--narrow {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
