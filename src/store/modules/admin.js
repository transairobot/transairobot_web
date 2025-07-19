/**
 * Admin store module
 */
export default {
  namespaced: true,
  state: {
    pendingApps: [],
    categories: [],
    loading: false,
    error: null
  },
  getters: {
    pendingApps: state => state.pendingApps,
    categories: state => state.categories,
    isLoading: state => state.loading
  },
  mutations: {
    SET_PENDING_APPS(state, apps) {
      state.pendingApps = apps;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchPendingApps({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // Import the admin service
        const adminService = await import('../../services/admin.service');
        const response = await adminService.getPendingApplications();

        // For development, use mock data if API returns empty
        let apps = response.data;
        if (!apps || apps.length === 0) {
          apps = [
            {
              id: '4',
              name: 'Speech Recognition',
              icon: '/assets/icons/speech.png',
              developer: 'AI Dev',
              submittedDate: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: '5',
              name: 'Object Detection',
              icon: '/assets/icons/object.png',
              developer: 'Vision Systems Inc.',
              submittedDate: new Date().toISOString(),
              status: 'pending'
            }
          ];
        }

        commit('SET_PENDING_APPS', apps);
      } catch (error) {
        console.error('Error fetching pending apps:', error);
        commit('SET_ERROR', 'Failed to load pending applications');

        // Fallback to mock data in case of error
        const mockPendingApps = [
          {
            id: '4',
            name: 'Speech Recognition',
            icon: '/assets/icons/speech.png',
            developer: 'AI Dev',
            submittedDate: new Date().toISOString(),
            status: 'pending'
          },
          {
            id: '5',
            name: 'Object Detection',
            icon: '/assets/icons/object.png',
            developer: 'Vision Systems Inc.',
            submittedDate: new Date().toISOString(),
            status: 'pending'
          }
        ];
        commit('SET_PENDING_APPS', mockPendingApps);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchCategories({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // Import the admin service
        const adminService = await import('../../services/admin.service');
        const response = await adminService.getCategories();

        // For development, use mock data if API returns empty
        let categories = response.data;
        if (!categories || categories.length === 0) {
          categories = [
            { id: '1', name: 'Navigation', count: 5 },
            { id: '2', name: 'Control', count: 8 },
            { id: '3', name: 'Vision', count: 3 },
            { id: '4', name: 'Speech', count: 2 }
          ];
        }

        commit('SET_CATEGORIES', categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        commit('SET_ERROR', 'Failed to load categories');

        // Fallback to mock data in case of error
        const mockCategories = [
          { id: '1', name: 'Navigation', count: 5 },
          { id: '2', name: 'Control', count: 8 },
          { id: '3', name: 'Vision', count: 3 },
          { id: '4', name: 'Speech', count: 2 }
        ];
        commit('SET_CATEGORIES', mockCategories);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async approveApp({ commit, state }, { appId, feedback }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // Import the admin service
        const adminService = await import('../../services/admin.service');
        const response = await adminService.approveApplication(appId, { feedback });

        // Remove the app from the pending list
        commit(
          'SET_PENDING_APPS',
          state.pendingApps.filter(app => app.id !== appId)
        );

        return { success: true, message: 'Application approved successfully' };
      } catch (error) {
        console.error('Error approving application:', error);
        commit('SET_ERROR', 'Failed to approve application');
        return { success: false, message: error.message || 'Failed to approve application' };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async rejectApp({ commit, state }, { appId, feedback }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // Import the admin service
        const adminService = await import('../../services/admin.service');
        const response = await adminService.rejectApplication(appId, { feedback });

        // Remove the app from the pending list
        commit(
          'SET_PENDING_APPS',
          state.pendingApps.filter(app => app.id !== appId)
        );

        return { success: true, message: 'Application rejected successfully' };
      } catch (error) {
        console.error('Error rejecting application:', error);
        commit('SET_ERROR', 'Failed to reject application');
        return { success: false, message: error.message || 'Failed to reject application' };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createCategory({ commit, state }, categoryData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        // Import the admin service
        const adminService = await import('../../services/admin.service');
        const response = await adminService.createCategory(categoryData);

        // Add the new category to the list
        const newCategory = response.data || {
          id: Date.now().toString(),
          name: categoryData.name,
          count: 0
        };

        commit('SET_CATEGORIES', [...state.categories, newCategory]);

        return { success: true, category: newCategory };
      } catch (error) {
        console.error('Error creating category:', error);
        commit('SET_ERROR', 'Failed to create category');
        return { success: false, message: error.message || 'Failed to create category' };
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
