import api from './api';
import notificationService from './notification.service';
import { PagedResult, Log } from './admin.service';
import { Application } from './application-store.service';

// Data structure classes
export class Robot {
  constructor(
    public id: string,
    public name: string,
    public model: string,
    public ownerId: string,
    public status: 'online' | 'offline' | 'maintenance',
    public lastSeen: Date
  ) {}
}

export class RobotStatus {
  constructor(
    public robotId: string,
    public status: 'online' | 'offline' | 'maintenance',
    public batteryLevel: number,
    public cpuUsage: number,
    public memoryUsage: number
  ) {}
}

export class TelemetryData {
  constructor(public timestamp: Date, public value: number) {}
}

export class NetworkConfig {
  constructor(
    public ipAddress: string,
    public subnetMask: string,
    public gateway: string,
    public dnsServers: string[]
  ) {}
}

class RobotManagementService {
  async getRobots(filters: any = {}, page = 1, limit = 10): Promise<PagedResult<Robot>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/robots/list', { params });
  }

  async getRobotDetails(robotId: string): Promise<Robot> {
    return await api.get(`/robots/${robotId}`);
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    const result = await api.put(`/robots/${robotId}`, robotData);
    notificationService.success('Robot updated successfully');
    return result;
  }

  async registerRobot(robotData: any): Promise<Robot> {
    const result = await api.post('/robots/register', robotData);
    notificationService.success('Robot registered successfully');
    return result;
  }

  async deregisterRobot(robotId: string): Promise<any> {
    const result = await api.delete(`/robots/${robotId}`);
    notificationService.success('Robot deregistered successfully');
    return result;
  }

  async getRobotStatus(robotId: string): Promise<RobotStatus> {
    return await api.get(`/robots/${robotId}/status`);
  }

  async getRobotApplications(robotId: string): Promise<Application[]> {
    return await api.get(`/robots/${robotId}/applications`);
  }

  async startApplication(robotId: string, applicationId: string): Promise<any> {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/start`, {});
    notificationService.success('Application started successfully');
    return result;
  }

  async stopApplication(robotId: string, applicationId: string): Promise<any> {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/stop`, {});
    notificationService.success('Application stopped successfully');
    return result;
  }

  async restartApplication(robotId: string, applicationId: string): Promise<any> {
    const result = await api.post(`/robots/${robotId}/applications/${applicationId}/restart`, {});
    notificationService.success('Application restarted successfully');
    return result;
  }

  async getRobotLogs(
    robotId: string,
    filters: any = {},
    page = 1,
    limit = 100
  ): Promise<PagedResult<Log>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get(`/robots/${robotId}/logs`, { params });
  }

  async getApplicationLogs(
    robotId: string,
    applicationId: string,
    filters: any = {},
    page = 1,
    limit = 100
  ): Promise<PagedResult<Log>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get(`/robots/${robotId}/applications/${applicationId}/logs`, { params });
  }

  async rebootRobot(robotId: string): Promise<any> {
    const result = await api.post(`/robots/${robotId}/reboot`, {});
    notificationService.success('Robot reboot initiated');
    return result;
  }

  async getRobotTelemetry(
    robotId: string,
    metric: string,
    timeRange: any = {}
  ): Promise<TelemetryData[]> {
    const params = {
      metric,
      ...timeRange
    };
    return await api.get(`/robots/${robotId}/telemetry`, { params });
  }

  async getRobotNetworkConfig(robotId: string): Promise<NetworkConfig> {
    return await api.get(`/robots/${robotId}/network`);
  }

  async updateRobotNetworkConfig(
    robotId: string,
    networkConfig: Partial<NetworkConfig>
  ): Promise<NetworkConfig> {
    const result = await api.put(`/robots/${robotId}/network`, networkConfig);
    notificationService.success('Network configuration updated successfully');
    return result;
  }
}

export default new RobotManagementService();
