<template>
  <div class="version-selector">
    <label for="version-select" class="version-label">Version:</label>
    <select
      id="version-select"
      class="version-select"
      :value="currentVersion ? currentVersion.id : ''"
      @change="handleVersionChange"
    >
      <option v-if="!versions || versions.length === 0" value="" disabled>
        No versions available
      </option>
      <option v-for="version in versions" :key="version.id" :value="version.id">
        {{ version.name }}{{ version.isDefault ? ' (Default)' : '' }}
      </option>
    </select>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DocumentationVersionSelector',

  props: {
    /**
     * Available versions
     */
    versions: {
      type: Array,
      default: () => []
    },

    /**
     * Current version
     */
    currentVersion: {
      type: Object,
      default: null
    }
  },

  emits: ['version-change'],

  setup(props, { emit }) {
    // Handle version change
    const handleVersionChange = event => {
      const versionId = event.target.value;
      const selectedVersion = props.versions.find(v => v.id === versionId);

      if (selectedVersion) {
        emit('version-change', selectedVersion);
      }
    };

    return {
      handleVersionChange
    };
  }
});
</script>

<style lang="scss" scoped>
.version-selector {
  padding: 0 1rem 1rem;
  display: flex;
  align-items: center;

  .version-label {
    margin-right: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .version-select {
    flex: 1;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  }
}
</style>
