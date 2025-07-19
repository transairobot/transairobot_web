/**
 * Documentation API Service
 * Handles API requests for documentation-related functionality
 */

import apiClient from './api';
import { handleApiError } from './error-handler.service';

/**
 * Documentation API Service
 */
export const DocumentationService = {
  /**
   * Get all documentation categories
   * @returns {Promise} Promise object with categories data
   */
  getCategories() {
    return apiClient
      .get('/documentation/categories')
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to fetch documentation categories'));
  },

  /**
   * Get all documents with optional filtering
   * @param {String} versionId - Optional version ID to filter by
   * @param {String} categoryId - Optional category ID to filter by
   * @returns {Promise} Promise object with documents data
   */
  getDocuments(versionId = null, categoryId = null) {
    const params = {};
    if (versionId) params.version = versionId;
    if (categoryId) params.category = categoryId;

    return apiClient
      .get('/documentation/documents', { params })
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to fetch documents'));
  },

  /**
   * Get document by ID
   * @param {String} documentId - Document ID
   * @returns {Promise} Promise object with document data
   */
  getDocumentById(documentId) {
    return apiClient
      .get(`/documentation/documents/${documentId}`)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to fetch document'));
  },

  /**
   * Get all available documentation versions
   * @returns {Promise} Promise object with versions data
   */
  getVersions() {
    return apiClient
      .get('/documentation/versions')
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to fetch documentation versions'));
  },

  /**
   * Search documents
   * @param {String} query - Search query
   * @param {String} versionId - Optional version ID to filter by
   * @returns {Promise} Promise object with search results
   */
  searchDocuments(query, versionId = null) {
    const params = { query };
    if (versionId) params.version = versionId;

    return apiClient
      .get('/documentation/search', { params })
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to search documents'));
  },

  /**
   * Create a new document (admin only)
   * @param {Object} documentData - Document data
   * @returns {Promise} Promise object with created document
   */
  createDocument(documentData) {
    return apiClient
      .post('/documentation/documents', documentData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to create document'));
  },

  /**
   * Update an existing document (admin only)
   * @param {String} documentId - Document ID
   * @param {Object} documentData - Updated document data
   * @returns {Promise} Promise object with updated document
   */
  updateDocument(documentId, documentData) {
    return apiClient
      .put(`/documentation/documents/${documentId}`, documentData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to update document'));
  },

  /**
   * Delete a document (admin only)
   * @param {String} documentId - Document ID
   * @returns {Promise} Promise object
   */
  deleteDocument(documentId) {
    return apiClient
      .delete(`/documentation/documents/${documentId}`)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to delete document'));
  },

  /**
   * Create a new category (admin only)
   * @param {Object} categoryData - Category data
   * @returns {Promise} Promise object with created category
   */
  createCategory(categoryData) {
    return apiClient
      .post('/documentation/categories', categoryData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to create category'));
  },

  /**
   * Update an existing category (admin only)
   * @param {String} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} Promise object with updated category
   */
  updateCategory(categoryId, categoryData) {
    return apiClient
      .put(`/documentation/categories/${categoryId}`, categoryData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to update category'));
  },

  /**
   * Delete a category (admin only)
   * @param {String} categoryId - Category ID
   * @returns {Promise} Promise object
   */
  deleteCategory(categoryId) {
    return apiClient
      .delete(`/documentation/categories/${categoryId}`)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to delete category'));
  },

  /**
   * Create a new version (admin only)
   * @param {Object} versionData - Version data
   * @returns {Promise} Promise object with created version
   */
  createVersion(versionData) {
    return apiClient
      .post('/documentation/versions', versionData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to create version'));
  },

  /**
   * Update an existing version (admin only)
   * @param {String} versionId - Version ID
   * @param {Object} versionData - Updated version data
   * @returns {Promise} Promise object with updated version
   */
  updateVersion(versionId, versionData) {
    return apiClient
      .put(`/documentation/versions/${versionId}`, versionData)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to update version'));
  },

  /**
   * Delete a version (admin only)
   * @param {String} versionId - Version ID
   * @returns {Promise} Promise object
   */
  deleteVersion(versionId) {
    return apiClient
      .delete(`/documentation/versions/${versionId}`)
      .then(response => response.data)
      .catch(error => handleApiError(error, 'Failed to delete version'));
  }
};

export default DocumentationService;
