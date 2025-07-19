// Mock robot service for testing
export default {
  getRobots: () =>
    Promise.resolve([
      { id: '1', name: 'Robot 1', status: 'online' },
      { id: '2', name: 'Robot 2', status: 'offline' }
    ]),

  getRobotById: id =>
    Promise.resolve({
      id,
      name: `Robot ${id}`,
      status: 'online',
      installedApps: []
    }),

  installApp: (robotId, appId) =>
    Promise.resolve({
      success: true,
      message: 'Application installed successfully'
    }),

  uninstallApp: (robotId, appId) =>
    Promise.resolve({
      success: true,
      message: 'Application uninstalled successfully'
    }),

  updateRobotStatus: (robotId, status) =>
    Promise.resolve({
      id: robotId,
      status,
      message: 'Robot status updated successfully'
    })
};
