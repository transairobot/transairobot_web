<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{
        'drag-over': isDragOver,
        uploading: isUploading,
        'has-file': uploadedFiles.length > 0
      }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        style="display: none"
      />

      <div v-if="!isUploading && uploadedFiles.length === 0" class="upload-content">
        <i class="upload-icon">📁</i>
        <p class="upload-text">
          {{ dragText || '点击或拖拽文件到此处上传' }}
        </p>
        <p class="upload-hint" v-if="hint">{{ hint }}</p>
      </div>

      <div v-else-if="!isUploading && uploadedFiles.length > 0" class="upload-preview">
        <div class="preview-container">
          <img
            v-if="isImageFile(uploadedFiles[0])"
            :src="getPreviewUrl(uploadedFiles[0])"
            :alt="uploadedFiles[0].name"
            class="preview-image"
          />
          <div v-else class="file-preview">
            <i class="file-icon">📄</i>
            <span class="file-name">{{ uploadedFiles[0].name }}</span>
          </div>
          <button @click="removeAllFiles" class="remove-preview-btn">×</button>
        </div>
      </div>

      <div v-else class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">上传中... {{ progress }}%</p>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadService } from '@/services';

export default {
  name: 'FileUpload',
  props: {
    accept: {
      type: String,
      default: '*/*'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 15 * 1024 * 1024 // 15MB
    },
    dragText: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isDragOver: false,
      isUploading: false,
      progress: 0,
      uploadedFiles: []
    };
  },
  methods: {
    triggerFileInput() {
      if (!this.isUploading) {
        this.$refs.fileInput.click();
      }
    },

    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.uploadFiles(files);
    },

    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      if (this.isUploading) return;

      const files = Array.from(event.dataTransfer.files);
      this.uploadFiles(files);
    },

    async uploadFiles(files) {
      if (files.length === 0) return;

      // 验证文件大小
      for (const file of files) {
        if (file.size > this.maxSize) {
          this.$emit(
            'error',
            `文件 ${file.name} 超过最大大小限制 ${this.formatFileSize(this.maxSize)}`
          );
          return;
        }
      }

      this.isUploading = true;
      this.progress = 0;

      try {
        const uploadPromises = files.map(file => this.uploadSingleFile(file));
        const results = await Promise.all(uploadPromises);

        const newFiles = results.map((url, index) => ({
          name: files[index].name,
          url: url,
          file: files[index]
        }));

        if (this.multiple) {
          this.uploadedFiles.push(...newFiles);
        } else {
          this.uploadedFiles = [newFiles[0]];
        }

        this.$emit('upload-success', this.multiple ? newFiles : newFiles[0]);
        this.$emit('files-changed', this.uploadedFiles);
      } catch (error) {
        this.$emit('error', error.message || '上传失败');
      } finally {
        this.isUploading = false;
        this.progress = 0;
      }
    },

    async uploadSingleFile(file) {
      return await uploadService.uploadFile(file, progress => {
        this.progress = progress;
      });
    },

    removeFile(index) {
      const removedFile = this.uploadedFiles.splice(index, 1)[0];
      this.$emit('file-removed', removedFile);
      this.$emit('files-changed', this.uploadedFiles);
    },

    removeAllFiles() {
      this.uploadedFiles = [];
      this.$emit('files-changed', this.uploadedFiles);
      // 清空文件输入框
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    isImageFile(file) {
      if (file.file && file.file.type) {
        return file.file.type.startsWith('image/');
      }
      // 如果没有file对象，根据文件名判断
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const fileName = file.name.toLowerCase();
      return imageExtensions.some(ext => fileName.endsWith(ext));
    },

    getPreviewUrl(file) {
      // 如果有原始文件对象，使用createObjectURL创建预览
      if (file.file) {
        return URL.createObjectURL(file.file);
      }
      // 否则使用上传后的URL
      return file.url;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    clearFiles() {
      this.uploadedFiles = [];
      this.$emit('files-changed', this.uploadedFiles);
    },

    getUploadedUrls() {
      return this.uploadedFiles.map(file => file.url);
    }
  },
  beforeUnmount() {
    // 清理创建的URL对象，避免内存泄漏
    this.uploadedFiles.forEach(file => {
      if (file.file && file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
  }
};
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-area.has-file {
  border-color: #28a745;
  background-color: #f8fff9;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.upload-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.preview-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 200px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.file-icon {
  font-size: 48px;
  opacity: 0.6;
}

.file-name {
  font-size: 14px;
  color: #666;
  text-align: center;
  word-break: break-word;
  max-width: 200px;
}

.remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.remove-preview-btn:hover {
  background: #ff3742;
}
</style>
