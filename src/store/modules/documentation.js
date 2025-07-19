/**
 * Documentation Vuex Module
 * Manages state for documentation content, structure, and operations
 */

const state = {
  documents: [], // List of all documents
  categories: [], // List of document categories
  currentDocument: null, // Currently viewed/edited document
  versions: [], // Available documentation versions
  currentVersion: null, // Currently selected version
  isLoading: false, // Loading state
  error: null, // Error state
  searchResults: [], // Search results
  searchQuery: '' // Current search query
};

const getters = {
  /**
   * Get all documents
   */
  allDocuments: state => state.documents,

  /**
   * Get all categories
   */
  allCategories: state => state.categories,

  /**
   * Get current document
   */
  currentDocument: state => state.currentDocument,

  /**
   * Get all versions
   */
  allVersions: state => state.versions,

  /**
   * Get current version
   */
  currentVersion: state => state.currentVersion,

  /**
   * Get loading state
   */
  isLoading: state => state.isLoading,

  /**
   * Get error state
   */
  error: state => state.error,

  /**
   * Get search results
   */
  searchResults: state => state.searchResults,

  /**
   * Get search query
   */
  searchQuery: state => state.searchQuery,

  /**
   * Get documents by category ID
   */
  getDocumentsByCategoryId: state => categoryId => {
    return state.documents.filter(doc => doc.categoryId === categoryId);
  },

  /**
   * Get category by ID
   */
  getCategoryById: state => categoryId => {
    return state.categories.find(category => category.id === categoryId);
  },

  /**
   * Get document by ID
   */
  getDocumentById: state => documentId => {
    return state.documents.find(doc => doc.id === documentId);
  },

  /**
   * Get nested categories structure
   */
  nestedCategories: state => {
    // Helper function to build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    return buildTree(state.categories);
  },

  /**
   * Get documents and categories that are visible to the current user
   */
  visibleCategories: (state, getters, rootState, rootGetters) => {
    const isAuthenticated = rootGetters['auth/isAuthenticated'];
    const user = rootGetters['auth/currentUser'];
    const userRole = user ? user.role : null;
    const isDeveloper = user && (user.role === 'developer' || user.developerStatus === 'approved');

    return state.categories.filter(category => {
      if (!category.accessLevel || category.accessLevel === 'public') {
        return true;
      }
      if (!isAuthenticated) {
        return false;
      }
      if (category.accessLevel === 'registered') {
        return true;
      }
      if (category.accessLevel === 'admin') {
        return userRole === 'admin';
      }
      if (category.accessLevel === 'developer') {
        return userRole === 'admin' || isDeveloper;
      }
      return false;
    });
  },

  visibleDocuments: (state, getters, rootState, rootGetters) => {
    const isAuthenticated = rootGetters['auth/isAuthenticated'];
    const user = rootGetters['auth/currentUser'];
    const userRole = user ? user.role : null;
    const isDeveloper = user && (user.role === 'developer' || user.developerStatus === 'approved');

    const visibleCategoryIds = new Set(getters.visibleCategories.map(c => c.id));

    return state.documents.filter(doc => {
      if (!visibleCategoryIds.has(doc.categoryId)) {
        return false;
      }
      if (!doc.accessLevel || doc.accessLevel === 'public') {
        return true;
      }
      if (!isAuthenticated) {
        return false;
      }
      if (doc.accessLevel === 'registered') {
        return true;
      }
      if (doc.accessLevel === 'admin') {
        return userRole === 'admin';
      }
      if (doc.accessLevel === 'developer') {
        return userRole === 'admin' || isDeveloper;
      }
      return false;
    });
  },

  visibleNestedCategories: (state, getters) => {
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    return buildTree(getters.visibleCategories);
  }
};

const mutations = {
  /**
   * Set documents
   */
  SET_DOCUMENTS(state, documents) {
    state.documents = documents;
  },

  /**
   * Set categories
   */
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },

  /**
   * Set current document
   */
  SET_CURRENT_DOCUMENT(state, document) {
    state.currentDocument = document;
  },

  /**
   * Set versions
   */
  SET_VERSIONS(state, versions) {
    state.versions = versions;
  },

  /**
   * Set current version
   */
  SET_CURRENT_VERSION(state, version) {
    state.currentVersion = version;
  },

  /**
   * Set loading state
   */
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },

  /**
   * Set error state
   */
  SET_ERROR(state, error) {
    state.error = error;
  },

  /**
   * Set search results
   */
  SET_SEARCH_RESULTS(state, results) {
    state.searchResults = results;
  },

  /**
   * Set search query
   */
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query;
  },

  /**
   * Add document
   */
  ADD_DOCUMENT(state, document) {
    state.documents.push(document);
  },

  /**
   * Update document
   */
  UPDATE_DOCUMENT(state, updatedDocument) {
    const index = state.documents.findIndex(doc => doc.id === updatedDocument.id);
    if (index !== -1) {
      state.documents.splice(index, 1, updatedDocument);
      if (state.currentDocument && state.currentDocument.id === updatedDocument.id) {
        state.currentDocument = updatedDocument;
      }
    }
  },

  /**
   * Delete document
   */
  DELETE_DOCUMENT(state, documentId) {
    state.documents = state.documents.filter(doc => doc.id !== documentId);
    if (state.currentDocument && state.currentDocument.id === documentId) {
      state.currentDocument = null;
    }
  },

  /**
   * Add category
   */
  ADD_CATEGORY(state, category) {
    state.categories.push(category);
  },

  /**
   * Update category
   */
  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
  },

  /**
   * Delete category
   */
  DELETE_CATEGORY(state, categoryId) {
    state.categories = state.categories.filter(cat => cat.id !== categoryId);
  }
};

const actions = {
  /**
   * Fetch all documents
   */
  async fetchDocuments({ commit, state }, { version = null } = {}) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // Use the current version if none provided
      const versionToUse = version || (state.currentVersion ? state.currentVersion.id : null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.getDocuments(versionToUse);

      commit('SET_DOCUMENTS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch documents');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Fetch all categories
   */
  async fetchCategories({ commit }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.getCategories();

      commit('SET_CATEGORIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch categories');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Fetch document by ID
   */
  async fetchDocumentById({ commit }, documentId) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.getDocumentById(documentId);

      commit('SET_CURRENT_DOCUMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch document');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Fetch all versions
   */
  async fetchVersions({ commit }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.getVersions();

      commit('SET_VERSIONS', response.data);

      // Set default version if available
      const defaultVersion = response.data.find(v => v.isDefault);
      if (defaultVersion) {
        commit('SET_CURRENT_VERSION', defaultVersion);
      } else if (response.data.length > 0) {
        commit('SET_CURRENT_VERSION', response.data[0]);
      }

      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch versions');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Set current version
   */
  setCurrentVersion({ commit, dispatch }, version) {
    commit('SET_CURRENT_VERSION', version);
    // Reload documents for the new version
    return dispatch('fetchDocuments', { version: version.id });
  },

  /**
   * Search documents
   */
  async searchDocuments({ commit }, query) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      commit('SET_SEARCH_QUERY', query);

      if (!query.trim()) {
        commit('SET_SEARCH_RESULTS', []);
        return [];
      }

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.searchDocuments(query);

      commit('SET_SEARCH_RESULTS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to search documents');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Create document (admin only)
   */
  async createDocument({ commit }, documentData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.createDocument(documentData);

      commit('ADD_DOCUMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to create document');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Update document (admin only)
   */
  async updateDocument({ commit }, { id, documentData }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.updateDocument(id, documentData);

      commit('UPDATE_DOCUMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to update document');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Delete document (admin only)
   */
  async deleteDocument({ commit }, documentId) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      await this._vm.$services.documentation.deleteDocument(documentId);

      commit('DELETE_DOCUMENT', documentId);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to delete document');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Create category (admin only)
   */
  async createCategory({ commit }, categoryData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.createCategory(categoryData);

      commit('ADD_CATEGORY', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to create category');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Update category (admin only)
   */
  async updateCategory({ commit }, { id, categoryData }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      const response = await this._vm.$services.documentation.updateCategory(id, categoryData);

      commit('UPDATE_CATEGORY', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to update category');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Delete category (admin only)
   */
  async deleteCategory({ commit }, categoryId) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      // This will be replaced with actual API call
      await this._vm.$services.documentation.deleteCategory(categoryId);

      commit('DELETE_CATEGORY', categoryId);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to delete category');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
