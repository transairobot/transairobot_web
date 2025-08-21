<template>
  <div class="category-test">
    <h3>Category Test Component</h3>
    <p>This component tests the multiple categories functionality</p>

    <div class="test-app" v-if="testApp">
      <h4>Test Application: {{ testApp.name }}</h4>
      <div class="categories">
        <span v-for="category in testApp.category" :key="category" class="category-badge">
          {{ category }}
        </span>
      </div>
    </div>

    <div class="test-form">
      <h4>Test Form</h4>
      <div class="selected-categories">
        <span v-for="categoryId in selectedCategories" :key="categoryId" class="category-tag">
          {{ getCategoryName(categoryId) }}
          <button @click="removeCategory(categoryId)">×</button>
        </span>
      </div>

      <select v-model="categoryToAdd" @change="addCategory">
        <option value="">Select category to add</option>
        <option v-for="category in availableCategories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryTestComponent',
  data() {
    return {
      testApp: {
        name: 'Test Application',
        category: ['Productivity', 'Utilities', 'Development']
      },
      selectedCategories: ['cat1', 'cat2'],
      categoryToAdd: '',
      categories: [
        { id: 'cat1', name: 'Productivity' },
        { id: 'cat2', name: 'Utilities' },
        { id: 'cat3', name: 'Development' },
        { id: 'cat4', name: 'Entertainment' }
      ]
    };
  },
  computed: {
    availableCategories() {
      return this.categories.filter(cat => !this.selectedCategories.includes(cat.id));
    }
  },
  methods: {
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Unknown';
    },

    addCategory() {
      if (this.categoryToAdd && !this.selectedCategories.includes(this.categoryToAdd)) {
        this.selectedCategories.push(this.categoryToAdd);
        this.categoryToAdd = '';
      }
    },

    removeCategory(categoryId) {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
.category-test {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 1rem 0;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin: 0.25rem;
  background-color: #007bff;
  color: white;
  border-radius: 16px;
}

.category-tag button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>
