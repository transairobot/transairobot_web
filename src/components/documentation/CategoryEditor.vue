<template>
  <div class="category-editor">
    <div class="form-group">
      <label for="category-name">Category Name</label>
      <input
        id="category-name"
        v-model="editableCategory.name"
        type="text"
        placeholder="Category name"
        required
      />
    </div>
    <div class="form-group">
      <label for="parent-category">Parent Category</label>
      <select id="parent-category" v-model="editableCategory.parentId">
        <option :value="null">None (Root Level)</option>
        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
          :disabled="cat.id === editableCategory.id"
        >
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label for="category-order">Display Order</label>
      <input id="category-order" v-model.number="editableCategory.order" type="number" min="0" />
    </div>
    <div class="form-group">
      <label for="access-level">Access Level</label>
      <select id="access-level" v-model="editableCategory.accessLevel" required>
        <option value="public">Public</option>
        <option value="registered">Registered Users</option>
        <option value="admin">Administrators</option>
        <option value="developer">Developers</option>
      </select>
    </div>
    <div class="editor-actions">
      <button class="cancel-button" @click="cancel">Cancel</button>
      <button class="save-button" @click="save" :disabled="!isFormValid">Save Category</button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'CategoryEditor',
  props: {
    category: {
      type: Object,
      default: null
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const store = useStore();
    const editableCategory = ref({
      name: '',
      parentId: null,
      order: 0,
      accessLevel: 'public'
    });

    const categories = computed(() => store.getters['documentation/allCategories']);

    watch(
      () => props.category,
      newCategory => {
        if (newCategory) {
          editableCategory.value = { ...newCategory };
        } else {
          editableCategory.value = { name: '', parentId: null, order: 0, accessLevel: 'public' };
        }
      },
      { immediate: true }
    );

    const isFormValid = computed(() => {
      return editableCategory.value.name.trim() !== '';
    });

    const save = () => {
      if (isFormValid.value) {
        emit('save', editableCategory.value);
      }
    };

    const cancel = () => {
      emit('cancel');
    };

    return {
      editableCategory,
      categories,
      isFormValid,
      save,
      cancel
    };
  }
});
</script>

<style lang="scss" scoped>
.category-editor {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-surface);

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input,
    select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background-color: var(--color-background);
      color: var(--color-text);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-light);
      }
    }
  }

  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;

      &.cancel-button {
        background: none;
        border: 1px solid var(--color-border);
        color: var(--color-text);

        &:hover {
          background-color: var(--color-background);
        }
      }

      &.save-button {
        background-color: var(--color-primary);
        border: none;
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--color-primary-dark);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
