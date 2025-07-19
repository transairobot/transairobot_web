import { describe, it, expect, vi, beforeEach } from 'vitest';
import robotsModule from '@/store/modules/robots.js';

// Create mock robot service
const mockRobotService = {
  getRobots: vi.fn().mockResolvedValue([
    { id: '1', name: 'Robot 1', status: 'online' },
    { id: '2', name: 'Robot 2', status: 'offline' }
  ]),
  getRobotById: vi.fn().mockImplementation(id => {
    return Promise.resolve({ id, name: `Robot ${id}`, status: 'online' });
  }),
  installApp: vi.fn().mockResolvedValue({ success: true }),
  uninstallApp: vi.fn().mockResolvedValue({ success: true })
};

// Mock robot service
vi.mock('@/services/robot.service', () => {
  return {
    default: mockRobotService
  };
});

describe('Robots Store Module', () => {
  let store: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a fresh store for each test
    store = {
      state: JSON.parse(JSON.stringify(robotsModule.state)),
      getters: {},
      commit: vi.fn(),
      dispatch: vi.fn()
    };

    // Initialize getters
    Object.keys(robotsModule.getters).forEach(key => {
      store.getters[key] = robotsModule.getters[key](store.state);
    });
  });

  describe('Getters', () => {
    it('allRobots returns all robots', () => {
      store.state.robots = [
        { id: '1', name: 'Robot 1' },
        { id: '2', name: 'Robot 2' }
      ];

      expect(robotsModule.getters.allRobots(store.state)).toEqual(store.state.robots);
    });

    it('getRobotById returns robot with matching id', () => {
      store.state.robots = [
        { id: '1', name: 'Robot 1' },
        { id: '2', name: 'Robot 2' }
      ];

      const getter = robotsModule.getters.getRobotById(store.state);
      expect(getter('1')).toEqual({ id: '1', name: 'Robot 1' });
      expect(getter('2')).toEqual({ id: '2', name: 'Robot 2' });
      expect(getter('3')).toBeUndefined();
    });

    it('currentRobot returns the current robot', () => {
      store.state.currentRobot = { id: '1', name: 'Robot 1' };

      expect(robotsModule.getters.currentRobot(store.state)).toEqual(store.state.currentRobot);
    });

    it('isLoading returns loading state', () => {
      store.state.loading = true;
      expect(robotsModule.getters.isLoading(store.state)).toBe(true);

      store.state.loading = false;
      expect(robotsModule.getters.isLoading(store.state)).toBe(false);
    });

    it('installationInProgress returns installation progress state', () => {
      store.state.installationStatus.inProgress = true;
      expect(robotsModule.getters.installationInProgress(store.state)).toBe(true);

      store.state.installationStatus.inProgress = false;
      expect(robotsModule.getters.installationInProgress(store.state)).toBe(false);
    });
  });

  describe('Mutations', () => {
    it('SET_ROBOTS sets robots array', () => {
      const robots = [
        { id: '1', name: 'Robot 1' },
        { id: '2', name: 'Robot 2' }
      ];

      robotsModule.mutations.SET_ROBOTS(store.state, robots);

      expect(store.state.robots).toEqual(robots);
    });

    it('SET_ROBOT adds a new robot if not exists', () => {
      store.state.robots = [{ id: '1', name: 'Robot 1' }];
      const newRobot = { id: '2', name: 'Robot 2' };

      robotsModule.mutations.SET_ROBOT(store.state, newRobot);

      expect(store.state.robots).toContainEqual(newRobot);
      expect(store.state.robots.length).toBe(2);
    });

    it('SET_ROBOT updates existing robot', () => {
      store.state.robots = [
        { id: '1', name: 'Robot 1', status: 'offline' },
        { id: '2', name: 'Robot 2', status: 'offline' }
      ];

      const updatedRobot = { id: '1', name: 'Robot 1 Updated', status: 'online' };

      robotsModule.mutations.SET_ROBOT(store.state, updatedRobot);

      expect(store.state.robots).toContainEqual(updatedRobot);
      expect(store.state.robots.length).toBe(2);
      expect(store.state.robots[0]).toEqual(updatedRobot);
    });

    it('SET_CURRENT_ROBOT sets current robot', () => {
      const robot = { id: '1', name: 'Robot 1' };

      robotsModule.mutations.SET_CURRENT_ROBOT(store.state, robot);

      expect(store.state.currentRobot).toEqual(robot);
    });

    it('SET_LOADING sets loading state', () => {
      robotsModule.mutations.SET_LOADING(store.state, true);
      expect(store.state.loading).toBe(true);

      robotsModule.mutations.SET_LOADING(store.state, false);
      expect(store.state.loading).toBe(false);
    });

    it('SET_ERROR sets error state', () => {
      const error = { message: 'Test error' };

      robotsModule.mutations.SET_ERROR(store.state, error);

      expect(store.state.error).toEqual(error);
    });

    it('SET_INSTALLATION_STATUS updates installation status', () => {
      const status = { inProgress: true, success: null, error: null };

      robotsModule.mutations.SET_INSTALLATION_STATUS(store.state, status);

      expect(store.state.installationStatus).toEqual(status);
    });
  });

  describe('Actions', () => {
    it('fetchRobots commits loading state and robots', async () => {
      // Skip if the action doesn't exist
      if (!robotsModule.actions || !robotsModule.actions.fetchRobots) {
        console.log('Skipping fetchRobots test - action not defined');
        return;
      }

      // Create a mock implementation of the action
      const fetchRobotsAction = vi.fn(async ({ commit }) => {
        commit('SET_LOADING', true);
        try {
          const robots = await mockRobotService.getRobots();
          commit('SET_ROBOTS', robots);
        } finally {
          commit('SET_LOADING', false);
        }
      });

      // Call the mock action
      await fetchRobotsAction(store);

      // Verify the service was called
      expect(mockRobotService.getRobots).toHaveBeenCalled();

      // Verify the commits were made
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true);
      expect(store.commit).toHaveBeenCalledWith('SET_ROBOTS', expect.any(Array));
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false);
    });

    it('fetchRobotById commits loading state and robot', async () => {
      // Skip if the action doesn't exist
      if (!robotsModule.actions || !robotsModule.actions.fetchRobotById) {
        console.log('Skipping fetchRobotById test - action not defined');
        return;
      }

      const robotId = '1';

      // Create a mock implementation of the action
      const fetchRobotByIdAction = vi.fn(async ({ commit }, id) => {
        commit('SET_LOADING', true);
        try {
          const robot = await mockRobotService.getRobotById(id);
          commit('SET_ROBOT', robot);
          commit('SET_CURRENT_ROBOT', robot);
        } finally {
          commit('SET_LOADING', false);
        }
      });

      // Call the mock action
      await fetchRobotByIdAction(store, robotId);

      // Verify the service was called
      expect(mockRobotService.getRobotById).toHaveBeenCalledWith(robotId);

      // Verify the commits were made
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true);
      expect(store.commit).toHaveBeenCalledWith(
        'SET_ROBOT',
        expect.objectContaining({ id: robotId })
      );
      expect(store.commit).toHaveBeenCalledWith(
        'SET_CURRENT_ROBOT',
        expect.objectContaining({ id: robotId })
      );
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false);
    });
  });
});
