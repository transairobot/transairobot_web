/**
 * Services index file
 */
import api from './api';
import authService from './auth.service';
import applicationStoreService from './application-store.service';
import robotManagementService from './robot-management.service';
import developerService from './developer.service';
import adminService from './admin.service';
import notificationService from './notification.service';
import errorHandler from './error-handler.service';
import transformer from './transformer.service';

// Export all services
export {
  api,
  authService,
  applicationStoreService,
  robotManagementService,
  developerService,
  adminService,
  notificationService,
  errorHandler,
  transformer
};

// Default export for convenience
export default {
  api,
  auth: authService,
  applicationStore: applicationStoreService,
  robotManagement: robotManagementService,
  developer: developerService,
  admin: adminService,
  notification: notificationService,
  errorHandler,
  transformer
};
