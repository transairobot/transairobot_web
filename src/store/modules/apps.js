export default {
  namespaced: true,
  state: {
    apps: [],
    featuredApps: [],
    currentApp: null,
    loading: false,
    error: null
  },
  getters: {
    allApps: state => state.apps,
    featuredApps: state => state.featuredApps,
    currentApp: state => state.currentApp,
    isLoading: state => state.loading
  },
  mutations: {
    SET_APPS(state, apps) {
      state.apps = apps;
    },
    SET_FEATURED_APPS(state, apps) {
      state.featuredApps = apps;
    },
    SET_CURRENT_APP(state, app) {
      state.currentApp = app;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    fetchApps({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockApps = [
          {
            id: '1',
            name: 'Robot Navigation',
            icon: '/assets/icons/nav.png',
            category: ['navigation']
          },
          { id: '2', name: 'Arm Control', icon: '/assets/icons/arm.png', category: ['control'] }
        ];
        commit('SET_APPS', mockApps);
        commit('SET_LOADING', false);
      }, 500);
    },
    fetchFeaturedApps({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockFeaturedApps = [
          { id: '1', name: 'Robot Navigation', icon: '/assets/icons/nav.png', featured: true },
          { id: '3', name: 'Vision System', icon: '/assets/icons/vision.png', featured: true }
        ];
        commit('SET_FEATURED_APPS', mockFeaturedApps);
        commit('SET_LOADING', false);
      }, 500);
    },
    fetchAppDetails({ commit }, appId) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        // Mock data with different details based on app ID
        let mockApp;

        switch (appId) {
          case 'app1':
            mockApp = {
              id: appId,
              name: 'PathFinder Pro',
              description:
                '# PathFinder Pro\n\n## Overview\n\nPathFinder Pro is an advanced navigation system for robots with obstacle avoidance and dynamic path planning capabilities.\n\n## Features\n\n* Real-time obstacle detection and avoidance\n* Dynamic path planning and re-routing\n* Integration with various sensor types\n* Support for indoor and outdoor environments\n* Energy-efficient route optimization\n\n## Technical Requirements\n\n* Compatible with TransAIRobot models TR-100 and above\n* Requires minimum 2GB RAM\n* Sensor package: Standard or Premium',
              icon: 'https://via.placeholder.com/128',
              version: '2.1.0',
              developer: 'TransAIRobot Navigation Team',
              category: ['navigation'],
              rating: 4.7,
              downloads: 12500
            };
            break;
          case 'app2':
            mockApp = {
              id: appId,
              name: 'ObjectVision',
              description:
                '# ObjectVision\n\n## Overview\n\nObjectVision is a state-of-the-art computer vision system for robots, enabling real-time object detection, recognition, and classification.\n\n## Features\n\n* Detect and classify over 1,000 common objects\n* Real-time processing at 30fps\n* Works in various lighting conditions\n* Custom object training capability\n* Integration with robot action systems\n\n## Technical Requirements\n\n* Compatible with TransAIRobot models with camera modules\n* Requires GPU acceleration\n* Minimum 4GB dedicated memory recommended',
              icon: 'https://via.placeholder.com/128',
              version: '1.5.2',
              developer: 'Vision Systems Inc.',
              category: ['vision'],
              rating: 4.2,
              downloads: 8700
            };
            break;
          case 'app3':
            mockApp = {
              id: appId,
              name: 'GripMaster',
              description:
                '# GripMaster\n\n## Overview\n\nGripMaster provides precision control for robotic arms with adaptive force feedback and object handling capabilities.\n\n## Features\n\n* Adaptive grip strength based on object fragility\n* Multi-finger coordination for complex objects\n* Slip detection and prevention\n* Integration with vision systems for pick-and-place\n* Support for various end effectors\n\n## Technical Requirements\n\n* Compatible with TransAIRobot manipulation modules\n* Requires force feedback sensors\n* Calibration wizard included',
              icon: 'https://via.placeholder.com/128',
              version: '3.0.1',
              developer: 'Robotic Interfaces Ltd',
              category: ['manipulation'],
              rating: 4.8,
              downloads: 5300
            };
            break;
          default:
            mockApp = {
              id: appId,
              name: 'Robot Application',
              description:
                '# Robot Application\n\n## Overview\n\nThis is a generic robot application with various features and capabilities.\n\n## Features\n\n* Feature 1\n* Feature 2\n* Feature 3\n\n## Technical Requirements\n\n* Compatible with most TransAIRobot models\n* Standard system requirements',
              icon: 'https://via.placeholder.com/128',
              version: '1.0.0',
              developer: 'TransAIRobot',
              category: ['utilities'],
              rating: 4.0,
              downloads: 1000
            };
        }

        commit('SET_CURRENT_APP', mockApp);
        commit('SET_LOADING', false);
      }, 500);
    }
  }
};
