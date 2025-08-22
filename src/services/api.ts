/**
 * Enhanced API service for making HTTP requests
 */
import store from '../store';
import errorHandler from './error-handler.service';
import transformer from './transformer.service';
import notificationService from './notification.service';
import authModalService from './auth-modal.service';
import { ApiResponse, SuccessCode, AuthFailedCode } from '../types/api';

// API configuration
const API_CONFIG = {
  baseUrl: process.env.VUE_APP_API_URL || 'https://api.example.com',
  timeout: 10000, // 10 seconds
  retryAttempts: 0,
  retryDelay: 2000 // 2 seconds
};

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface RequestOptions {
  includeAuth?: boolean;
  showErrorNotification?: boolean;
  retry?: number;
  params?: Record<string, any> | null;
  returnFullResponse?: boolean;
  onProgress?: ((progress: number) => void) | null;
}

interface FullResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

/**
 * Create headers for API requests
 * @param {boolean} includeAuth - Whether to include auth token in headers
 * @param {boolean} isFormData - Whether the request contains form data
 * @returns {Record<string, string>} Headers object
 */
const createHeaders = (includeAuth = true, isFormData = false): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client-Version': process.env.VUE_APP_VERSION || '1.0.0',
    'X-Client-Platform': 'web'
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @param {string} endpoint - API endpoint
 * @param {boolean} returnFullResponse - Whether to return full response object
 * @returns {Promise<any>} Promise resolving to response data
 */
const handleResponse = async <T>(
  response: Response,
  endpoint: string,
  returnFullResponse = false
): Promise<any> => {
  const newToken = response.headers.get('x-access-token');
  if (newToken) {
    try {
      if (store && store.dispatch) {
        store.dispatch('auth/updateToken', newToken);
      }
    } catch (error) {
      console.warn('Failed to update token in store:', error);
    }
  }

  // Handle authentication errors first
  if (response.status === 401) {
    store.dispatch('auth/logout');
    notificationService.error('Session expired. Please login again.');
    return Promise.reject(new Error('Session expired. Please login again.'));
  }

  let data: any;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, handle as plain text or blob for non-ok responses
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = errorText || errorHandler.getErrorMessageByStatusCode(response.status);
        return Promise.reject(new Error(errorMessage));
      }
      data = await response.text();
      // For successful non-JSON responses, return directly
      return data;
    }
  } catch (error) {
    console.error('Response parsing error:', error);
    return Promise.reject(new Error('Invalid response format'));
  }

  // Check for authentication failure first (regardless of HTTP status)
  if (data && data.code === AuthFailedCode) {
    store.dispatch('auth/logout');
    authModalService.showAuthModal('You are not logged in. Please login to continue.');
    return Promise.reject(new Error('AUTHENTICATION_FAILED')); // Special error type
  }

  // For JSON responses, check the custom API response structure
  if (response.ok) {
    const apiResponse = data as ApiResponse<T>;

    if (apiResponse.code !== SuccessCode) {
      // Handle other API-level errors (e.g., validation errors)
      notificationService.error(apiResponse.message);
      return Promise.reject(new Error(apiResponse.message));
    }

    const transformedData = transformer.transformResponse(apiResponse.data, endpoint);

    if (returnFullResponse) {
      return {
        data: transformedData,
        headers: response.headers,
        status: response.status
      };
    }

    return transformedData;
  }

  // Handle other HTTP errors that returned JSON
  const errorMessage =
    data.message || data.msg || errorHandler.getErrorMessageByStatusCode(response.status);
  return Promise.reject(new Error(errorMessage));
};

/**
 * Retry request with exponential backoff
 * @param {Function} requestFn - Request function
 * @param {number} retries - Number of retries left
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise<any>} Promise resolving to response data
 */
const retryRequest = async (
  requestFn: () => Promise<any>,
  retries: number,
  delay: number
): Promise<any> => {
  try {
    return await requestFn();
  } catch (error: any) {
    // Don't retry if we're out of retries or if it's an auth error
    if (retries <= 0 || (error.response && error.response.status === 401)) {
      throw error;
    }

    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry with exponential backoff
    return retryRequest(requestFn, retries - 1, delay * 2);
  }
};

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const get = async (endpoint: string, options: RequestOptions = {}): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    params = null,
    returnFullResponse = false
  } = options;

  // Build URL with query parameters
  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(includeAuth),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint, returnFullResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {any} data - Request payload
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const post = async (
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    returnFullResponse = false
  } = options;

  // Transform request data
  const transformedData = transformer.transformRequest(data, endpoint);

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: createHeaders(includeAuth),
        body: JSON.stringify(transformedData),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint, returnFullResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {any} data - Request payload
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const put = async (
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    returnFullResponse = false
  } = options;

  // Transform request data
  const transformedData = transformer.transformRequest(data, endpoint);

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: createHeaders(includeAuth),
        body: JSON.stringify(transformedData),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint, returnFullResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Make a PATCH request
 * @param {string} endpoint - API endpoint
 * @param {any} data - Request payload
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const patch = async (
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    returnFullResponse = false
  } = options;

  // Transform request data
  const transformedData = transformer.transformRequest(data, endpoint);

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: createHeaders(includeAuth),
        body: JSON.stringify(transformedData),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint, returnFullResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const del = async (endpoint: string, options: RequestOptions = {}): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    returnFullResponse = false
  } = options;

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: createHeaders(includeAuth),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint, returnFullResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Upload files with form data
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - FormData object with files and other data
 * @param {RequestOptions} options - Request options
 * @returns {Promise<any>} Promise resolving to response data
 */
export const uploadFiles = async (
  endpoint: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<any> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    onProgress = null,
    returnFullResponse = false
  } = options;

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout * 2); // Double timeout for uploads

      // Use XMLHttpRequest for upload progress
      if (onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', event => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            clearTimeout(timeoutId);

            if (xhr.status === 401) {
              store.dispatch('auth/logout');
              notificationService.error('Session expired. Please login again.');
              const error: any = new Error('Session expired. Please login again.');
              error.status = xhr.status;
              errorHandler.handleError(error, showErrorNotification);
              reject(error);
              return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              let data;
              try {
                data = JSON.parse(xhr.responseText);

                // Check for authentication failure first (regardless of HTTP status)
                if (data && data.code === AuthFailedCode) {
                  store.dispatch('auth/logout');
                  authModalService.showAuthModal(
                    'You are not logged in. Please login to continue.'
                  );
                  reject(new Error('AUTHENTICATION_FAILED')); // Special error type
                  return;
                }

                const apiResponse = data as ApiResponse<any>;

                if (apiResponse.code !== SuccessCode) {
                  notificationService.error(apiResponse.message);
                  reject(new Error(apiResponse.message));
                  return;
                }

                const transformedData = transformer.transformResponse(apiResponse.data, endpoint);

                if (returnFullResponse) {
                  resolve({
                    data: transformedData,
                    headers: {
                      get: (name: string) => xhr.getResponseHeader(name)
                    },
                    status: xhr.status
                  });
                } else {
                  resolve(transformedData);
                }
              } catch (e) {
                // Handle cases where response is not JSON
                resolve(xhr.responseText);
              }
            } else {
              let errorMessage;
              let errorData;
              try {
                errorData = JSON.parse(xhr.responseText);

                // Check for authentication failure first
                if (errorData && errorData.code === AuthFailedCode) {
                  store.dispatch('auth/logout');
                  authModalService.showAuthModal(
                    'You are not logged in. Please login to continue.'
                  );
                  reject(new Error('AUTHENTICATION_FAILED')); // Special error type
                  return;
                }

                errorMessage = errorData.message || errorData.msg || `Error: ${xhr.status}`;
              } catch (e) {
                errorMessage = xhr.responseText || `Error: ${xhr.status}`;
              }

              const error: any = new Error(errorMessage);
              error.status = xhr.status;

              errorHandler.handleError(error, showErrorNotification);
              reject(error);
            }
          });

          xhr.addEventListener('error', () => {
            clearTimeout(timeoutId);
            const error = new Error('Network error');
            errorHandler.handleError(error, showErrorNotification);
            reject(error);
          });

          xhr.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            const error = new Error('Upload aborted');
            reject(error);
          });

          xhr.addEventListener('timeout', () => {
            clearTimeout(timeoutId);
            const error = new Error('Upload timed out');
            errorHandler.handleError(error, showErrorNotification);
            reject(error);
          });

          xhr.open('POST', `${API_CONFIG.baseUrl}${endpoint}`);
          xhr.withCredentials = true; // 支持 cookie

          // Set headers
          const headers = createHeaders(includeAuth, true);
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value as string);
          });

          xhr.send(formData);
        });
      } else {
        // Use fetch API if no progress callback
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: createHeaders(includeAuth, true),
          body: formData,
          credentials: 'include', // 支持 cookie
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return handleResponse(response, endpoint, returnFullResponse);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

/**
 * Download file from API
 * @param {string} endpoint - API endpoint
 * @param {string} filename - Filename to save as
 * @param {RequestOptions} options - Request options
 * @returns {Promise<{ success: boolean; filename: string }>} Promise resolving when download completes
 */
export const downloadFile = async (
  endpoint: string,
  filename: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; filename: string }> => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    params = null
  } = options;

  // Build URL with query parameters
  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout * 2); // Double timeout for downloads

      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(includeAuth),
        credentials: 'include', // 支持 cookie
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle error responses
        return handleResponse(response, endpoint);
      }

      // Get blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      return { success: true, filename };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Download timed out');
      }

      // Handle network errors
      if (!navigator.onLine) {
        notificationService.error('Network error. Please check your internet connection.');
      }

      errorHandler.handleError(error, showErrorNotification);
      throw error;
    }
  };

  return retryRequest(executeRequest, retry, API_CONFIG.retryDelay);
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFiles,
  downloadFile,

  // Export configuration for testing and debugging
  config: API_CONFIG as ApiConfig
};
