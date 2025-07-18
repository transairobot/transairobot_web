/**
 * Base API service for making HTTP requests
 */

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://api.example.com';

/**
 * Create headers for API requests
 * @param {boolean} includeAuth - Whether to include auth token in headers
 * @returns {Object} Headers object
 */
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };

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
 * @returns {Promise} Promise resolving to response data
 */
const handleResponse = async response => {
  const data = await response.json();

  if (!response.ok) {
    const error = data.message || response.statusText;
    return Promise.reject(error);
  }

  return data;
};

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Promise} Promise resolving to response data
 */
export const get = async (endpoint, includeAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: createHeaders(includeAuth)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API GET Error:', error);
    return Promise.reject(error);
  }
};

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Promise} Promise resolving to response data
 */
export const post = async (endpoint, data, includeAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(includeAuth),
      body: JSON.stringify(data)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API POST Error:', error);
    return Promise.reject(error);
  }
};

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Promise} Promise resolving to response data
 */
export const put = async (endpoint, data, includeAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: createHeaders(includeAuth),
      body: JSON.stringify(data)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API PUT Error:', error);
    return Promise.reject(error);
  }
};

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Promise} Promise resolving to response data
 */
export const del = async (endpoint, includeAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: createHeaders(includeAuth)
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API DELETE Error:', error);
    return Promise.reject(error);
  }
};

export default {
  get,
  post,
  put,
  delete: del
};
