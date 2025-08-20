class TransformerService {
  transformRequest(data: any, endpoint: string): any {
    if (!data) return data;

    const transformedData = { ...data };

    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    if (endpoint.includes('/auth/register')) {
      if (transformedData.name) {
        transformedData.name = transformedData.name.trim();
      }
      if (transformedData.email) {
        transformedData.email = transformedData.email.trim().toLowerCase();
      }
    }

    if (endpoint.includes('/applications/submit')) {
      if (transformedData.tags && Array.isArray(transformedData.tags)) {
        transformedData.tags = [...new Set(transformedData.tags.map((tag: any) => tag.trim()))];
      }
    }

    return transformedData;
  }

  transformResponse(data: any, endpoint: string): any {
    if (!data) return data;

    // 对于analytics端点，直接返回原始数据，不进行转换
    if (endpoint.includes('/admin/analysis/')) {
      return data;
    }

    if (endpoint.includes('/applications/list')) {
      let transformedData = data;
      if (transformedData && Array.isArray(transformedData)) {
        transformedData = transformedData.map((item: any) => this.transformApplicationItem(item));
      }
      return transformedData;
    }

    if (endpoint.includes('/robots/list')) {
      let transformedData = data;
      if (transformedData && Array.isArray(transformedData)) {
        transformedData = transformedData.map((item: any) => this.transformRobotItem(item));
      }
      return transformedData;
    }

    const transformedData = { ...data };
    return transformedData;
  }

  transformApplicationItem(item: any): any {
    if (!item) return item;

    const transformedItem = { ...item };

    transformedItem.isPublished = transformedItem.status === 'published';
    transformedItem.isPending = transformedItem.status === 'pending';
    transformedItem.isRejected = transformedItem.status === 'rejected';

    if (transformedItem.createdAt) {
      transformedItem.createdAtFormatted = new Date(transformedItem.createdAt).toLocaleDateString();
    }

    if (transformedItem.updatedAt) {
      transformedItem.updatedAtFormatted = new Date(transformedItem.updatedAt).toLocaleDateString();
    }

    return transformedItem;
  }

  transformRobotItem(item: any): any {
    if (!item) return item;

    const transformedItem = { ...item };

    transformedItem.isOnline = transformedItem.status === 'online';
    transformedItem.isOffline = transformedItem.status === 'offline';
    transformedItem.isMaintenance = transformedItem.status === 'maintenance';

    if (transformedItem.lastSeen) {
      transformedItem.lastSeenFormatted = new Date(transformedItem.lastSeen).toLocaleString();
    }

    return transformedItem;
  }
}

export default new TransformerService();
