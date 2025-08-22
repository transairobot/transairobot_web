import api from './api';
import notificationService from './notification.service';
import { handleServiceError } from '../utils/error-utils';
import {
  Application,
  InfiniteScrollResponse,
  InfiniteScrollParams
} from './application-store.service';

// Data structure classes
export class Robot {
  constructor(
    public id: string,
    public name: string,
    public model: string,
    public robot_type: string,
    public owner_id: string,
    public connection_status: 'online' | 'offline' | 'maintenance',
    public last_seen: Date,
    public installed_apps: Application[] = []
  ) {}
  toString(): string {
    return `Robot(id=${this.id}, name=${this.name}, model=${this.model}, owner_id=${this.owner_id}, connection_status=${this.connection_status}, last_seen=${this.last_seen})`;
  }
}

class RobotManagementService {
  // 无限分页获取机器人列表（用户端）
  async getRobotsInfinite(
    params: InfiniteScrollParams = {}
  ): Promise<InfiniteScrollResponse<Robot>> {
    const queryParams = {
      limit: 20,
      ...params
    };

    try {
      const response = await api.get('/robots/list', {
        params: queryParams,
        showErrorNotification: false
      });

      // 转换日期字段
      if (response.data) {
        response.data = response.data.map((robot: any) => ({
          ...robot,
          last_seen: new Date(robot.last_seen),
          installed_apps:
            robot.installed_apps?.map((app: any) => ({
              ...app,
              createdAt: new Date(app.createdAt),
              updatedAt: new Date(app.updatedAt)
            })) || []
        }));
      }

      return response;
    } catch (error: any) {
      handleServiceError(error, '获取机器人列表失败');
      throw error;
    }
  }

  // 无限分页获取活跃机器人列表
  async getActiveRobotsInfinite(
    params: InfiniteScrollParams = {}
  ): Promise<InfiniteScrollResponse<Robot>> {
    const queryParams = {
      limit: 20,
      ...params
    };

    try {
      const response = await api.get('/robots/active', { params: queryParams });

      // 转换日期字段
      if (response.data) {
        response.data = response.data.map((robot: any) => ({
          ...robot,
          last_seen: new Date(robot.last_seen),
          installed_apps:
            robot.installed_apps?.map((app: any) => ({
              ...app,
              createdAt: new Date(app.createdAt),
              updatedAt: new Date(app.updatedAt)
            })) || []
        }));
      }

      return response;
    } catch (error: any) {
      handleServiceError(error, '获取活跃机器人列表失败');
      throw error;
    }
  }

  // 传统方式获取机器人列表（兼容性保留）
  async getRobots(): Promise<Array<Robot>> {
    try {
      const response = await api.get('/robots/list');
      return response.map((robot: any) => ({
        ...robot,
        last_seen: new Date(robot.last_seen),
        installed_apps:
          robot.installed_apps?.map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt)
          })) || []
      }));
    } catch (error: any) {
      handleServiceError(error, '获取机器人列表失败');
      throw error;
    }
  }

  async addRobot(bindCode: string): Promise<Robot> {
    try {
      const result = await api.post(`/robots/add_robot/${bindCode}`, {});
      notificationService.success('机器人添加成功');
      return {
        ...result,
        last_seen: new Date(result.last_seen),
        installed_apps:
          result.installed_apps?.map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt)
          })) || []
      };
    } catch (error: any) {
      handleServiceError(error, '添加机器人失败');
      throw error;
    }
  }

  async getRobotDetails(robotId: string): Promise<Robot> {
    try {
      const result = await api.get(`/robots/${robotId}`);
      return {
        ...result,
        last_seen: new Date(result.last_seen),
        installed_apps:
          result.installed_apps?.map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt)
          })) || []
      };
    } catch (error: any) {
      handleServiceError(error, '获取机器人详情失败');
      throw error;
    }
  }

  async removeRobot(robotId: string): Promise<any> {
    try {
      const result = await api.delete(`/robots/remove/${robotId}`);
      notificationService.success('机器人移除成功');
      return result;
    } catch (error) {
      console.error('Failed to remove robot:', error);
      notificationService.error('移除机器人失败');
      throw error;
    }
  }

  async installRobotApp(robotId: string, appId: string): Promise<any> {
    try {
      const result = await api.put(`/robots/install_app/${robotId}/${appId}`, {});
      notificationService.success('应用安装成功');
      return result;
    } catch (error) {
      console.error('Failed to install app:', error);
      notificationService.error('应用安装失败');
      throw error;
    }
  }

  async runRobotApp(robotId: string, appId: string): Promise<any> {
    try {
      const result = await api.put(`/robots/run_app/${robotId}/${appId}`, {});
      notificationService.success('应用启动成功');
      return result;
    } catch (error) {
      console.error('Failed to run app:', error);
      notificationService.error('应用启动失败');
      throw error;
    }
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    try {
      const result = await api.put(`/robots/update/${robotId}`, robotData);
      notificationService.success('机器人更新成功');
      return {
        ...result,
        last_seen: new Date(result.last_seen),
        installed_apps:
          result.installed_apps?.map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt)
          })) || []
      };
    } catch (error) {
      console.error('Failed to update robot:', error);
      notificationService.error('机器人更新失败');
      throw error;
    }
  }

  // 文件上传
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const uploadService = await import('./upload.service');
    return uploadService.default.uploadFile(file, onProgress);
  }
}

export default new RobotManagementService();
