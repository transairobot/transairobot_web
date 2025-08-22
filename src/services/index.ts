import api from './api';
import authService from './auth.service';
import applicationStoreService from './application-store.service';
import robotManagementService from './robot-management.service';
import adminService from './admin.service';
import uploadService from './upload.service';
import notificationService from './notification.service';
import errorHandler from './error-handler.service';
import transformer from './transformer.service';
import authModalService from './auth-modal.service';

export {
  api,
  authService,
  applicationStoreService,
  robotManagementService,
  adminService,
  uploadService,
  notificationService,
  errorHandler,
  transformer,
  authModalService
};

export default {
  api,
  auth: authService,
  applicationStore: applicationStoreService,
  robotManagement: robotManagementService,
  admin: adminService,
  upload: uploadService,
  notification: notificationService,
  errorHandler,
  transformer,
  authModal: authModalService
};
