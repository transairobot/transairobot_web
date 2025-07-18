/**
 * Admin service for managing admin-related API calls
 */
import api from './api';

/**
 * Get pending applications for review
 * @returns {Promise} Promise resolving to pending applications
 */
export const getPendingApplications = () => {
  return api.get('/admin/applications/pending');
};

/**
 * Get application details for review
 * @param {string} appId - Application ID
 * @returns {Promise} Promise resolving to application details
 */
export const getApplicationForReview = appId => {
  return api.get(`/admin/applications/${appId}`);
};

/**
 * Approve an application
 * @param {string} appId - Application ID
 * @param {Object} reviewData - Review data including feedback
 * @returns {Promise} Promise resolving to approval result
 */
export const approveApplication = (appId, reviewData) => {
  return api.post(`/admin/applications/${appId}/approve`, reviewData);
};

/**
 * Reject an application
 * @param {string} appId - Application ID
 * @param {Object} reviewData - Review data including feedback
 * @returns {Promise} Promise resolving to rejection result
 */
export const rejectApplication = (appId, reviewData) => {
  return api.post(`/admin/applications/${appId}/reject`, reviewData);
};

/**
 * Feature an application in the store
 * @param {string} appId - Application ID
 * @param {boolean} featured - Whether to feature or unfeature
 * @returns {Promise} Promise resolving to feature update result
 */
export const featureApplication = (appId, featured) => {
  return api.put(`/admin/applications/${appId}/feature`, { featured });
};

/**
 * Get store categories
 * @returns {Promise} Promise resolving to store categories
 */
export const getCategories = () => {
  return api.get('/admin/categories');
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise} Promise resolving to created category
 */
export const createCategory = categoryData => {
  return api.post('/admin/categories', categoryData);
};

/**
 * Update a category
 * @param {string} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise} Promise resolving to updated category
 */
export const updateCategory = (categoryId, categoryData) => {
  return api.put(`/admin/categories/${categoryId}`, categoryData);
};

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 * @returns {Promise} Promise resolving to deletion result
 */
export const deleteCategory = categoryId => {
  return api.delete(`/admin/categories/${categoryId}`);
};

export default {
  getPendingApplications,
  getApplicationForReview,
  approveApplication,
  rejectApplication,
  featureApplication,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
