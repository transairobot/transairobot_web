import robotService from '../../services/robot.service';

export default {
  namespaced: true,
  state: {
    robots: [],
    currentRobot: null,
    loading: false,
    error: null,
    installationStatus: {
      inProgress: false,
      success: null,
      error: null
    }
  },
  getters: {
    allRobots: state => state.robots,
    getRobotById: state => id => {
      return state.robots.find(robot => robot.id === id);
    },
    currentRobot: state => state.currentRobot,
    isLoading: state => state.loading,
    installationInProgress: state => state.installationStatus.inProgress,
    installationSuccess: state => state.installationStatus.success,
    installationError: state => state.installationStatus.error
  },
  mutations: {
    SET_ROBOTS(state, robots) {
      state.robots = robots;
    },
    SET_ROBOT(state, robot) {
      const index = state.robots.findIndex(r => r.id === robot.id);
      if (index !== -1) {
        state.robots.splice(index, 1, robot);
      } else {
        state.robots.push(robot);
      }
    },
    SET_CURRENT_ROBOT(state, robot) {
      state.currentRobot = robot;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_INSTALLATION_STATUS(state, status) {
      state.installationStatus = { ...state.installationStatus, ...status };
    },
    ADD_APP_TO_ROBOT(state, { robotId, app }) {
      const robot = state.robots.find(r => r.id === robotId);
      if (robot) {
        if (!robot.installedApps) {
          robot.installedApps = [];
        }
        // Check if app is already installed
        const existingAppIndex = robot.installedApps.findIndex(a => a.id === app.id);
        if (existingAppIndex === -1) {
          robot.installedApps.push(app);
        }

        // If this is the current robot, update it too
        if (state.currentRobot && state.currentRobot.id === robotId) {
          if (!state.currentRobot.installedApps) {
            state.currentRobot.installedApps = [];
          }
          const currentExistingAppIndex = state.currentRobot.installedApps.findIndex(
            a => a.id === app.id
          );
          if (currentExistingAppIndex === -1) {
            state.currentRobot.installedApps.push(app);
          }
        }
      }
    },
    REMOVE_APP_FROM_ROBOT(state, { robotId, appId }) {
      const robot = state.robots.find(r => r.id === robotId);
      if (robot && robot.installedApps) {
        robot.installedApps = robot.installedApps.filter(app => app.id !== appId);

        // If this is the current robot, update it too
        if (
          state.currentRobot &&
          state.currentRobot.id === robotId &&
          state.currentRobot.installedApps
        ) {
          state.currentRobot.installedApps = state.currentRobot.installedApps.filter(
            app => app.id !== appId
          );
        }
      }
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
    fetchRobotById({ commit }, robotId) {
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
        commit('SET_ROBOT', mockRobot);
        commit('SET_CURRENT_ROBOT', mockRobot);
        commit('SET_LOADING', false);
      }, 500);
    },
    async installApp({ commit, rootGetters }, { robotId, appId }) {
      commit('SET_INSTALLATION_STATUS', { inProgress: true, success: null, error: null });
      try {
        await robotService.installApp(robotId, appId);
        const app = rootGetters['apps/currentApp'] || {
          id: appId,
          name: 'Unknown App',
          icon: '/assets/icons/default-app.png',
          version: '1.0.0'
        };
        commit('ADD_APP_TO_ROBOT', {
          robotId,
          app: {
            id: app.id,
            name: app.name,
            icon: app.icon,
            version: app.version
          }
        });
        commit('SET_INSTALLATION_STATUS', { inProgress: false, success: true, error: null });
      } catch (error) {
        commit('SET_INSTALLATION_STATUS', {
          inProgress: false,
          success: false,
          error: error.message || 'Failed to install application'
        });
        throw error;
      }
    },
    async uninstallApp({ commit }, { robotId, appId }) {
      try {
        await robotService.removeApp(robotId, appId);
        commit('REMOVE_APP_FROM_ROBOT', { robotId, appId });
      } catch (error) {
        console.error(`Failed to uninstall app: ${error}`);
        // Optionally, dispatch an action to show a notification to the user
        throw error;
      }
    },
    updateApp({ commit, dispatch }, { robotId, appId }) {
      // This would typically involve uninstalling and reinstalling the app
      // For now, we'll just simulate a successful update
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 1500);
      });
    },
    resetInstallationStatus({ commit }) {
      commit('SET_INSTALLATION_STATUS', { inProgress: false, success: null, error: null });
    }
  }
};
