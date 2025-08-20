<template>
  <div class="container" :class="{ 'container-fluid': fluid }">
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
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
}

.container-fluid {
  max-width: none;
}
</style>
