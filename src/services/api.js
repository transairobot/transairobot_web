/**
 * Enhanced API service for making HTTP requests
 */
import store from '../store';
import errorHandler from './error-handler.service';
import transformer from './transformer.service';
import notificationService from './notification.service';

// API configuration
const API_CONFIG = {
  baseUrl: process.env.VUE_APP_API_BASE_URL || 'https://api.example.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  retryDelay: 1000 // 1 second
};

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

/**
 * Process failed requests queue
 * @param {string} token - New token
 * @param {boolean} isSuccess - Whether token refresh was successful
 */
const processQueue = (token, isSuccess) => {
  failedQueue.forEach(prom => {
    if (isSuccess) {
      prom.resolve(token);
    } else {
      prom.reject(new Error('Token refresh failed'));
    }
  });

  failedQueue = [];
};

/**
 * Create headers for API requests
 * @param {boolean} includeAuth - Whether to include auth token in headers
 * @param {boolean} isFormData - Whether the request contains form data
 * @returns {Object} Headers object
 */
const createHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {
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
 * @param {Function} originalRequest - Function to retry the original request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise resolving to response data
 */
const handleResponse = async (response, originalRequest, endpoint) => {
  // Handle different response types
  let data;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    // Handle JSON parsing error
    console.error('Response parsing error:', error);
    return Promise.reject(new Error('Invalid response format'));
  }

  // Handle successful responses
  if (response.ok) {
    // Transform response data
    return transformer.transformResponse(data, endpoint);
  }

  // Handle authentication errors
  if (response.status === 401) {
    // If token refresh endpoint returns 401, logout
    if (endpoint.includes('/auth/refresh-token')) {
      store.dispatch('auth/logout');
      notificationService.error('Session expired. Please login again.');
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Try to refresh token
    if (!isRefreshing) {
      isRefreshing = true;

      return store
        .dispatch('auth/refreshToken')
        .then(success => {
          isRefreshing = false;

          if (success) {
            // Process queued requests with new token
            processQueue(localStorage.getItem('token'), true);
            // Retry original request
            return originalRequest();
          } else {
            // Token refresh failed, logout
            processQueue(null, false);
            store.dispatch('auth/logout');
            notificationService.error('Session expired. Please login again.');
            return Promise.reject(new Error('Session expired. Please login again.'));
          }
        })
        .catch(error => {
          isRefreshing = false;
          processQueue(null, false);
          store.dispatch('auth/logout');
          notificationService.error('Authentication failed. Please login again.');
          return Promise.reject(error);
        });
    } else {
      // Queue failed request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          return originalRequest();
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
  }

  // Handle specific error status codes
  const errorMessage = data.message || errorHandler.getErrorMessageByStatusCode(response.status);
  return Promise.reject(new Error(errorMessage));
};

/**
 * Retry request with exponential backoff
 * @param {Function} requestFn - Request function
 * @param {number} retries - Number of retries left
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Promise resolving to response data
 */
const retryRequest = async (requestFn, retries, delay) => {
  try {
    return await requestFn();
  } catch (error) {
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
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const get = async (endpoint, options = {}) => {
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
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(includeAuth),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, executeRequest, endpoint);
    } catch (error) {
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
 * @param {Object} data - Request payload
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const post = async (endpoint, data, options = {}) => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts
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
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, executeRequest, endpoint);
    } catch (error) {
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
 * @param {Object} data - Request payload
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const put = async (endpoint, data, options = {}) => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts
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
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, executeRequest, endpoint);
    } catch (error) {
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
 * @param {Object} data - Request payload
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const patch = async (endpoint, data, options = {}) => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts
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
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, executeRequest, endpoint);
    } catch (error) {
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
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const del = async (endpoint, options = {}) => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts
  } = options;

  const executeRequest = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: createHeaders(includeAuth),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(response, executeRequest, endpoint);
    } catch (error) {
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
 * @param {Object} formData - FormData object with files and other data
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving to response data
 */
export const uploadFiles = async (endpoint, formData, options = {}) => {
  const {
    includeAuth = true,
    showErrorNotification = true,
    retry = API_CONFIG.retryAttempts,
    onProgress = null
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
            if (xhr.status >= 200 && xhr.status < 300) {
              let data;
              try {
                data = JSON.parse(xhr.responseText);
                resolve(transformer.transformResponse(data, endpoint));
              } catch (e) {
                resolve(xhr.responseText);
              }
            } else {
              let errorMessage;
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMessage = errorData.message || `Error: ${xhr.status}`;
              } catch (e) {
                errorMessage = `Error: ${xhr.status}`;
              }

              const error = new Error(errorMessage);
              error.status = xhr.status;

              if (xhr.status === 401) {
                // Handle auth errors
                if (endpoint.includes('/auth/refresh-token')) {
                  store.dispatch('auth/logout');
                  notificationService.error('Session expired. Please login again.');
                } else {
                  // Try to refresh token and retry
                  store
                    .dispatch('auth/refreshToken')
                    .then(success => {
                      if (success) {
                        executeRequest().then(resolve).catch(reject);
                      } else {
                        store.dispatch('auth/logout');
                        notificationService.error('Session expired. Please login again.');
                        reject(error);
                      }
                    })
                    .catch(() => {
                      store.dispatch('auth/logout');
                      notificationService.error('Authentication failed. Please login again.');
                      reject(error);
                    });
                  return;
                }
              }

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

          // Set headers
          const headers = createHeaders(includeAuth, true);
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });

          xhr.send(formData);
        });
      } else {
        // Use fetch API if no progress callback
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: createHeaders(includeAuth, true),
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return handleResponse(response, executeRequest, endpoint);
      }
    } catch (error) {
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
 * @param {Object} options - Request options
 * @returns {Promise} Promise resolving when download completes
 */
export const downloadFile = async (endpoint, filename, options = {}) => {
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
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle error responses
        return handleResponse(response, executeRequest, endpoint);
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
    } catch (error) {
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
  config: API_CONFIG
};
