export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const SuccessCode = 0;
export const AuthFailedCode = 100101;

// Application related types
export interface Application {
  id: string;
  name: string;
  description: string;
  developerId: string;
  category: string[]; // Changed to array for multiple categories
  categoryIds?: string[]; // For form handling
  version: string;
  rating: number;
  iconUrl: string;
  iconURI?: string; // Alternative field name
  downloads: number;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  count?: number;
}

export interface CreateApplicationRequest {
  name: string;
  description: string;
  categoryIds: string[]; // Array of category IDs
  version: string;
  iconURI: string;
  config?: any;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  version?: string;
  iconURI?: string;
  categoryIds?: string[]; // Array of category IDs
}
