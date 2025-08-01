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
    public robot_type: string,
    public owner_id: string,
    public connection_status: 'online' | 'offline' | 'maintenance',
    public last_seen: Date
  ) {}
  toString(): string {
    return `Robot(id=${this.id}, name=${this.name}, model=${this.model}, owner_id=${this.owner_id}, connection_status=${this.connection_status}, last_seen=${this.last_seen})`;
  }
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
  async addRobot(bindCode: string): Promise<Robot> {
    const result = await api.post(`/robots/add_robot/${bindCode}`, {});
    notificationService.success('Robot added successfully');
    return result;
  }

  async getRobots(filters: any = {}, page = 1, limit = 10): Promise<Array<Robot>> {
    const params = {
      page,
      limit,
      ...filters
    };
    return await api.get('/robots/list', { params });
  }

  async getRobotDetails(robotId: string): Promise<Robot> {
    const robot = await api.get(`/robots/${robotId}`);
    return robot;
  }

  async removeRobot(robotId: string): Promise<Robot> {
    const robot = await api.delete(`/robots/remove/${robotId}`);
    return robot;
  }

  async installRobotApp(robotId: string, app_id: string): Promise<Robot> {
    const robot = await api.put(`/robots/install_app/${robotId}/${app_id}`, {});
    return robot;
  }

  async updateRobot(robotId: string, robotData: Partial<Robot>): Promise<Robot> {
    const result = await api.put(`/robots/update/${robotId}`, robotData);
    notificationService.success('Robot updated successfully');
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
