export default {
  namespaced: true,
  state: {
    robots: [],
    currentRobot: null,
    loading: false,
    error: null
  },
  getters: {
    allRobots: state => state.robots,
    currentRobot: state => state.currentRobot,
    isLoading: state => state.loading
  },
  mutations: {
    SET_ROBOTS(state, robots) {
      state.robots = robots;
    },
    SET_CURRENT_ROBOT(state, robot) {
      state.currentRobot = robot;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    fetchRobots({ commit }) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockRobots = [
          {
            id: '1',
            name: 'Home Assistant',
            icon: '/assets/icons/robot1.png',
            status: 'online',
            type: 'mobile-arm'
          },
          {
            id: '2',
            name: 'Factory Bot',
            icon: '/assets/icons/robot2.png',
            status: 'offline',
            type: 'arm'
          }
        ];
        commit('SET_ROBOTS', mockRobots);
        commit('SET_LOADING', false);
      }, 500);
    },
    fetchRobotDetails({ commit }, robotId) {
      commit('SET_LOADING', true);
      // API call would go here
      setTimeout(() => {
        const mockRobot = {
          id: robotId,
          name: 'Home Assistant',
          icon: '/assets/icons/robot1.png',
          status: 'online',
          type: 'mobile-arm',
          installedApps: [
            { id: '1', name: 'Robot Navigation', icon: '/assets/icons/nav.png', version: '1.0.0' },
            { id: '3', name: 'Vision System', icon: '/assets/icons/vision.png', version: '2.1.0' }
          ],
          lastConnected: new Date().toISOString()
        };
        commit('SET_CURRENT_ROBOT', mockRobot);
        commit('SET_LOADING', false);
      }, 500);
    }
  }
};
