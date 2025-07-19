/**
 * Transformer service for API requests and responses
 */

class TransformerService {
  /**
   * Transform request data before sending to API
   * @param {Object} data - Request data
   * @param {string} endpoint - API endpoint
   * @returns {Object} Transformed request data
   */
  transformRequest(data, endpoint) {
    if (!data) return data;

    // Clone data to avoid modifying original
    const transformedData = { ...data };

    // Remove undefined values
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    // Endpoint-specific transformations
    if (endpoint.includes('/auth/register')) {
      // Format registration data
      if (transformedData.name) {
        transformedData.name = transformedData.name.trim();
      }
      if (transformedData.email) {
        transformedData.email = transformedData.email.trim().toLowerCase();
      }
    }

    if (endpoint.includes('/applications/submit')) {
      // Format application submission data
      if (transformedData.tags && Array.isArray(transformedData.tags)) {
        // Ensure tags are unique and trimmed
        transformedData.tags = [...new Set(transformedData.tags.map(tag => tag.trim()))];
      }
    }

    return transformedData;
  }

  /**
   * Transform response data from API
   * @param {Object} data - Response data
   * @param {string} endpoint - API endpoint
   * @returns {Object} Transformed response data
   */
  transformResponse(data, endpoint) {
    if (!data) return data;

    // Clone data to avoid modifying original
    const transformedData = { ...data };

    // Endpoint-specific transformations
    if (endpoint.includes('/applications/list')) {
      // Transform application list data
      if (transformedData.items && Array.isArray(transformedData.items)) {
        transformedData.items = transformedData.items.map(item =>
          this.transformApplicationItem(item)
        );
      }
    }

    if (endpoint.includes('/robots/list')) {
      // Transform robot list data
      if (transformedData.items && Array.isArray(transformedData.items)) {
        transformedData.items = transformedData.items.map(item => this.transformRobotItem(item));
      }
    }

    return transformedData;
  }

  /**
   * Transform application item
   * @param {Object} item - Application item
   * @returns {Object} Transformed application item
   */
  transformApplicationItem(item) {
    if (!item) return item;

    // Clone item to avoid modifying original
    const transformedItem = { ...item };

    // Add computed properties
    transformedItem.isPublished = transformedItem.status === 'published';
    transformedItem.isPending = transformedItem.status === 'pending';
    transformedItem.isRejected = transformedItem.status === 'rejected';

    // Format dates
    if (transformedItem.createdAt) {
      transformedItem.createdAtFormatted = new Date(transformedItem.createdAt).toLocaleDateString();
    }

    if (transformedItem.updatedAt) {
      transformedItem.updatedAtFormatted = new Date(transformedItem.updatedAt).toLocaleDateString();
    }

    return transformedItem;
  }

  /**
   * Transform robot item
   * @param {Object} item - Robot item
   * @returns {Object} Transformed robot item
   */
  transformRobotItem(item) {
    if (!item) return item;

    // Clone item to avoid modifying original
    const transformedItem = { ...item };

    // Add computed properties
    transformedItem.isOnline = transformedItem.status === 'online';
    transformedItem.isOffline = transformedItem.status === 'offline';
    transformedItem.isMaintenance = transformedItem.status === 'maintenance';

    // Format dates
    if (transformedItem.lastSeen) {
      transformedItem.lastSeenFormatted = new Date(transformedItem.lastSeen).toLocaleString();
    }

    return transformedItem;
  }
}

export default new TransformerService();
