# API Integration Guide

This document describes how to interact with the TransAIRobot backend API from the frontend application.

## API Service Structure

The API services are organized in the `src/services` directory:

```
src/services/
├── api.ts                # Base API configuration
├── auth.service.ts       # Authentication services
├── application.service.ts # Application store services
├── robot.service.ts      # Robot management services
├── developer.service.ts  # Developer portal services
├── admin.service.ts      # Admin services
└── types.ts             # API type definitions
```

## Base API Configuration

The base API service handles common functionality like:
- Request/response interceptors
- Authentication token management
- Error handling
- Request cancellation

Example from `api.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import store from '@/store';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = store.getters['auth/token'];
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await store.dispatch('auth/refreshToken');
        const token = store.getters['auth/token'];
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch('auth/logout');
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Authentication Service

The authentication service handles user login, registration, and token management.

Example from `auth.service.ts`:

```typescript
import apiClient from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from './types';

export const AuthService = {
  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials)
      .then(response => response.data);
  },
  
  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/register', userData)
      .then(response => response.data);
  },
  
  /**
   * Refresh the access token using a refresh token
   */
  refreshToken(): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh')
      .then(response => response.data);
  },
  
  /**
   * Logout the current user
   */
  logout(): Promise<void> {
    return apiClient.post('/auth/logout')
      .then(() => {});
  }
};
```

## Application Service

The application service handles fetching and managing applications in the store.

Example from `application.service.ts`:

```typescript
import apiClient from './api';
import { 
  Application, 
  ApplicationFilter, 
  PaginatedResponse,
  InstallRequest 
} from './types';

export const ApplicationService = {
  /**
   * Get a paginated list of applications
   */
  getApplications(filters: ApplicationFilter): Promise<PaginatedResponse<Application>> {
    return apiClient.get('/applications', { params: filters })
      .then(response => response.data);
  },
  
  /**
   * Get application details by ID
   */
  getApplicationById(id: string): Promise<Application> {
    return apiClient.get(`/applications/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Get featured applications
   */
  getFeaturedApplications(): Promise<Application[]> {
    return apiClient.get('/applications/featured')
      .then(response => response.data);
  },
  
  /**
   * Install an application on a robot
   */
  installApplication(request: InstallRequest): Promise<{ taskId: string }> {
    return apiClient.post('/applications/install', request)
      .then(response => response.data);
  },
  
  /**
   * Get installation status
   */
  getInstallationStatus(taskId: string): Promise<{ status: string; progress: number }> {
    return apiClient.get(`/applications/install/${taskId}/status`)
      .then(response => response.data);
  }
};
```

## Error Handling

When making API calls, use try/catch blocks to handle errors:

```typescript
import { ApplicationService } from '@/services/application.service';

export default {
  methods: {
    async fetchApplications() {
      this.loading = true;
      try {
        const result = await ApplicationService.getApplications({
          page: this.currentPage,
          limit: this.pageSize,
          category: this.selectedCategory,
          search: this.searchQuery
        });
        this.applications = result.data;
        this.totalItems = result.total;
      } catch (error) {
        this.error = 'Failed to load applications. Please try again.';
        console.error('Error fetching applications:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
```

## API Response Types

Define TypeScript interfaces for API responses in `types.ts`:

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  iconUrl: string;
  screenshots: string[];
}

export interface Robot {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  applications: InstalledApplication[];
}

export interface InstalledApplication {
  id: string;
  applicationId: string;
  name: string;
  version: string;
  status: 'running' | 'stopped' | 'error';
  installedAt: string;
}
```

## Making API Calls in Components

Use the API services in your Vue components:

```vue
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ApplicationService } from '@/services/application.service';
import { Application } from '@/services/types';

export default defineComponent({
  setup() {
    const applications = ref<Application[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchApplications = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await ApplicationService.getApplications({
          page: 1,
          limit: 10
        });
        applications.value = response.data;
      } catch (err) {
        error.value = 'Failed to load applications';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchApplications();
    });

    return {
      applications,
      loading,
      error
    };
  }
});
</script>
```

## API Mocking for Development

During development, you can use mock API responses:

1. Create a mock service in `src/services/mock`:

```typescript
// src/services/mock/application.mock.ts
import { Application, PaginatedResponse } from '../types';

const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Navigation System',
    description: 'Advanced navigation for robots',
    version: '1.2.0',
    author: 'TransAIRobot',
    category: 'Navigation',
    tags: ['navigation', 'mapping'],
    rating: 4.5,
    downloads: 1250,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-06-20T14:45:00Z',
    iconUrl: '/images/apps/navigation-icon.png',
    screenshots: ['/images/apps/navigation-1.png', '/images/apps/navigation-2.png']
  },
  // More mock applications...
];

export const MockApplicationService = {
  getApplications(filters: any): Promise<PaginatedResponse<Application>> {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: mockApplications,
          total: mockApplications.length,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: Math.ceil(mockApplications.length / (filters.limit || 10))
        });
      }, 300);
    });
  },
  
  // Other mock methods...
};
```

2. Use environment variables to switch between real and mock services:

```typescript
// src/services/index.ts
import { AuthService as RealAuthService } from './auth.service';
import { ApplicationService as RealApplicationService } from './application.service';
import { MockApplicationService } from './mock/application.mock';

export const AuthService = RealAuthService;

export const ApplicationService = 
  process.env.VUE_APP_USE_MOCK_API === 'true' 
    ? MockApplicationService 
    : RealApplicationService;
```
