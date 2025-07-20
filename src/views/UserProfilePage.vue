<template>
  <div class="user-profile-page">
    <AppContainer>
      <AuthGuard>
        <h1 class="page-title">My Profile</h1>

        <!-- Loading State -->
        <LoadingState v-if="loading" message="Loading profile data..." />

        <!-- Error State -->
        <ErrorState v-else-if="error" :message="error" buttonText="Retry" @retry="retryLoading" />

        <!-- Profile Content -->
        <div v-else class="profile-layout">
          <div class="profile-sidebar">
            <div class="profile-avatar-section">
              <div class="avatar-container">
                <img
                  :src="profileData.avatar || require('@/assets/images/default-avatar.png')"
                  alt="Profile Avatar"
                  class="profile-avatar"
                />
                <div class="avatar-overlay" @click="openAvatarUpload">
                  <span class="avatar-edit-icon">
                    <i class="fas fa-camera"></i>
                  </span>
                </div>
              </div>
              <input
                type="file"
                ref="avatarInput"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <div v-if="avatarUploading" class="avatar-uploading">
                <div class="spinner"></div>
                <span>Uploading...</span>
              </div>
              <div class="avatar-help-text">Click on the avatar to change your profile picture</div>
            </div>

            <div class="profile-menu">
              <div
                class="profile-menu-item"
                :class="{ active: activeTab === 'general' }"
                @click="activeTab = 'general'"
              >
                <i class="fas fa-user"></i>
                General Information
              </div>
              <div
                class="profile-menu-item"
                :class="{ active: activeTab === 'security' }"
                @click="activeTab = 'security'"
              >
                <i class="fas fa-lock"></i>
                Security
              </div>
              <div
                class="profile-menu-item"
                :class="{ active: activeTab === 'preferences' }"
                @click="activeTab = 'preferences'"
              >
                <i class="fas fa-cog"></i>
                Preferences
              </div>
            </div>
          </div>

          <div class="profile-content">
            <AppCard>
              <!-- General Information Tab -->
              <div v-if="activeTab === 'general'">
                <h2 class="section-title">General Information</h2>
                <form @submit.prevent="updateProfile" class="profile-form">
                  <div class="form-group" :class="{ 'has-error': formErrors.profile.nickname }">
                    <label for="nickname">Display Name</label>
                    <input
                      type="text"
                      id="nickname"
                      v-model="profileData.nickname"
                      class="form-control"
                      required
                    />
                    <small v-if="formErrors.profile.nickname" class="error-text">
                      {{ formErrors.profile.nickname }}
                    </small>
                  </div>

                  <div class="form-group">
                    <label for="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      v-model="profileData.email"
                      class="form-control"
                      required
                      disabled
                    />
                    <small class="form-text">Email cannot be changed</small>
                  </div>

                  <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea
                      id="bio"
                      v-model="profileData.bio"
                      class="form-control"
                      rows="4"
                      placeholder="Tell us about yourself"
                    ></textarea>
                    <small class="form-text">
                      Share a brief description about yourself (optional)
                    </small>
                  </div>

                  <div class="form-actions">
                    <AppButton type="submit" :disabled="updating">
                      <span v-if="updating" class="button-spinner"></span>
                      {{ updating ? 'Saving...' : 'Save Changes' }}
                    </AppButton>
                  </div>
                </form>
              </div>

              <!-- Security Tab -->
              <div v-if="activeTab === 'security'">
                <h2 class="section-title">Security</h2>
                <form @submit.prevent="changePassword" class="profile-form">
                  <div
                    class="form-group"
                    :class="{ 'has-error': formErrors.password.currentPassword }"
                  >
                    <label for="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      v-model="passwordData.currentPassword"
                      class="form-control"
                      required
                    />
                    <small v-if="formErrors.password.currentPassword" class="error-text">
                      {{ formErrors.password.currentPassword }}
                    </small>
                  </div>

                  <div class="form-group" :class="{ 'has-error': formErrors.password.newPassword }">
                    <label for="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      v-model="passwordData.newPassword"
                      class="form-control"
                      required
                    />
                    <small class="form-text">
                      Password must be at least 8 characters with uppercase, lowercase, and numbers
                    </small>
                    <small v-if="formErrors.password.newPassword" class="error-text">
                      {{ formErrors.password.newPassword }}
                    </small>
                  </div>

                  <div
                    class="form-group"
                    :class="{ 'has-error': formErrors.password.confirmPassword }"
                  >
                    <label for="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      v-model="passwordData.confirmPassword"
                      class="form-control"
                      required
                    />
                    <small v-if="formErrors.password.confirmPassword" class="error-text">
                      {{ formErrors.password.confirmPassword }}
                    </small>
                  </div>

                  <div class="form-actions">
                    <AppButton type="submit" :disabled="updating">
                      <span v-if="updating" class="button-spinner"></span>
                      {{ updating ? 'Updating...' : 'Update Password' }}
                    </AppButton>
                  </div>
                </form>
              </div>

              <!-- Preferences Tab -->
              <div v-if="activeTab === 'preferences'">
                <h2 class="section-title">Preferences</h2>
                <form @submit.prevent="updatePreferences" class="profile-form">
                  <div class="form-group">
                    <label>Email Notifications</label>
                    <div class="checkbox-group">
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="preferences.emailNotifications.news" />
                        News and updates
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          v-model="preferences.emailNotifications.robotUpdates"
                        />
                        Robot updates
                      </label>
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          v-model="preferences.emailNotifications.appUpdates"
                        />
                        App updates
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Display Preferences</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          v-model="preferences.theme"
                        />
                        Use system theme
                      </label>
                      <label class="radio-label">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          v-model="preferences.theme"
                        />
                        Light theme
                      </label>
                      <label class="radio-label">
                        <input type="radio" name="theme" value="dark" v-model="preferences.theme" />
                        Dark theme
                      </label>
                    </div>
                  </div>

                  <div class="form-actions">
                    <AppButton type="submit" :disabled="updating">
                      <span v-if="updating" class="button-spinner"></span>
                      {{ updating ? 'Saving...' : 'Save Preferences' }}
                    </AppButton>
                  </div>
                </form>
              </div>
            </AppCard>
          </div>
        </div>

        <AppToast
          v-if="toast.show"
          :message="toast.message"
          :type="toast.type"
          @close="toast.show = false"
        />
      </AuthGuard>
    </AppContainer>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppContainer from '../components/common/AppContainer.vue';
import AppCard from '../components/common/AppCard.vue';
import AppButton from '../components/common/AppButton.vue';
import AppToast from '../components/common/AppToast.vue';
import AuthGuard from '../components/common/AuthGuard.vue';
import LoadingState from '../components/common/LoadingState.vue';
import ErrorState from '../components/common/ErrorState.vue';
import authService from '../services/auth.service';
import { validatePassword, validateForm } from '../utils/validation';

export default {
  name: 'UserProfilePage',
  components: {
    AppContainer,
    AppCard,
    AppButton,
    AppToast,
    AuthGuard,
    LoadingState,
    ErrorState
  },
  setup() {
    const store = useStore();
    const avatarInput = ref(null);

    const activeTab = ref('general');
    const updating = ref(false);
    const avatarUploading = ref(false);
    const loading = ref(true);
    const error = ref(null);

    const toast = ref({
      show: false,
      message: '',
      type: 'success'
    });

    const profileData = ref({
      nickname: '',
      email: '',
      avatar: '',
      bio: ''
    });

    const passwordData = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const preferences = ref({
      emailNotifications: {
        news: true,
        robotUpdates: true,
        appUpdates: true
      },
      theme: 'system'
    });

    const formErrors = ref({
      profile: {},
      password: {}
    });

    const currentUser = computed(() => store.getters['auth/currentUser']);

    // Load user data
    onMounted(async () => {
      try {
        loading.value = true;
        error.value = null;

        if (currentUser.value) {
          const userData = {
            nickname: currentUser.value.nickname || '',
            email: currentUser.value.email || '',
            avatar: currentUser.value.avatar || '',
            bio: currentUser.value.bio || ''
          };

          profileData.value = { ...userData };

          // Load preferences if available
          if (currentUser.value.preferences) {
            preferences.value = {
              ...preferences.value,
              ...currentUser.value.preferences
            };
          }
          loading.value = false;
        } else {
          const user = await authService.getProfile();
          const userData = {
            nickname: user.nickname || '',
            email: user.email || '',
            avatar: user.avatar || '',
            bio: user.bio || ''
          };

          profileData.value = { ...userData };

          if (user.preferences) {
            preferences.value = {
              ...preferences.value,
              ...user.preferences
            };
          }

          store.dispatch('auth/updateUser', user);
          loading.value = false;
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
        error.value = err.message || 'Failed to load profile data';
        loading.value = false;
      }
    });

    // Show toast message
    const showToast = (message, type = 'success') => {
      toast.value = {
        show: true,
        message,
        type
      };

      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    // Validate profile form
    const validateProfileForm = () => {
      const rules = {
        nickname: {
          required: true,
          minLength: 3,
          maxLength: 30
        }
      };

      const errors = validateForm(profileData.value, rules);
      formErrors.value.profile = errors;

      return Object.keys(errors).length === 0;
    };

    // Validate password form
    const validatePasswordForm = () => {
      // First check if passwords match
      if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        formErrors.value.password = {
          confirmPassword: 'Passwords do not match'
        };
        return false;
      }

      // Then validate password strength
      const passwordValidation = validatePassword(passwordData.value.newPassword);
      if (!passwordValidation.isValid) {
        formErrors.value.password = {
          newPassword: passwordValidation.message
        };
        return false;
      }

      // Check if current password is provided
      if (!passwordData.value.currentPassword) {
        formErrors.value.password = {
          currentPassword: 'Current password is required'
        };
        return false;
      }

      formErrors.value.password = {};
      return true;
    };

    // Update profile
    const updateProfile = async () => {
      if (!validateProfileForm()) {
        return;
      }

      try {
        updating.value = true;

        // 构建只包含变更字段的更新对象，直接使用 currentUser 比较
        const updateData = {};

        // 只有当字段值与 currentUser 中的原始值不同时才添加到更新数据中
        if (profileData.value.nickname !== (currentUser.value?.nickname || '')) {
          updateData.nickname = profileData.value.nickname;
        }

        if (profileData.value.bio !== (currentUser.value?.bio || '')) {
          updateData.bio = profileData.value.bio;
        }

        // 如果没有任何字段发生变化，显示提示信息
        if (Object.keys(updateData).length === 0) {
          showToast('No changes detected', 'info');
          return;
        }

        const updatedProfile = await authService.updateProfile(updateData);

        // 更新 store
        store.dispatch('auth/updateUser', updatedProfile.data || updatedProfile);

        showToast('Profile updated successfully');
      } catch (error) {
        showToast(error.message || 'Failed to update profile', 'error');
      } finally {
        updating.value = false;
      }
    };

    // Change password
    const changePassword = async () => {
      if (!validatePasswordForm()) {
        return;
      }

      try {
        updating.value = true;

        await authService.changePassword(
          passwordData.value.currentPassword,
          passwordData.value.newPassword
        );

        // Clear form
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        showToast('Password updated successfully');
      } catch (error) {
        showToast(error.message || 'Failed to update password', 'error');
      } finally {
        updating.value = false;
      }
    };

    // Update preferences
    const updatePreferences = async () => {
      try {
        updating.value = true;

        const updatedProfile = await authService.updateProfile({
          preferences: preferences.value
        });

        // Apply theme change immediately if needed
        if (preferences.value.theme !== 'system') {
          document.documentElement.setAttribute('data-theme', preferences.value.theme);
        } else {
          // Use system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        store.dispatch('auth/updateUser', updatedProfile);
        showToast('Preferences updated successfully');
      } catch (error) {
        showToast(error.message || 'Failed to update preferences', 'error');
      } finally {
        updating.value = false;
      }
    };

    // Open avatar upload dialog
    const openAvatarUpload = () => {
      avatarInput.value.click();
    };

    // Handle avatar file selection
    const handleAvatarChange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showToast('Image size should not exceed 5MB', 'error');
        return;
      }

      try {
        avatarUploading.value = true;

        // Create form data
        const formData = new FormData();
        formData.append('avatar', file);

        // Upload avatar
        const response = await authService.uploadAvatar(formData);

        // Update profile with new avatar
        profileData.value.avatar = response.avatarUrl;
        store.dispatch('auth/updateUser', { avatar: response.avatarUrl });

        showToast('Avatar updated successfully');
      } catch (error) {
        showToast(error.message || 'Failed to upload avatar', 'error');
      } finally {
        avatarUploading.value = false;
        // Reset the file input so the same file can be selected again if needed
        event.target.value = '';
      }
    };

    // Retry loading profile data
    const retryLoading = async () => {
      loading.value = true;
      error.value = null;

      try {
        const user = await authService.getProfile();
        const userData = {
          nickname: user.nickname || '',
          email: user.email || '',
          avatar: user.avatar || '',
          bio: user.bio || ''
        };

        profileData.value = { ...userData };

        if (user.preferences) {
          preferences.value = {
            ...preferences.value,
            ...user.preferences
          };
        }

        store.dispatch('auth/updateUser', user);
        loading.value = false;
      } catch (err) {
        console.error('Failed to load profile data', err);
        error.value = err.message || 'Failed to load profile data';
        loading.value = false;
      }
    };

    return {
      activeTab,
      profileData,
      passwordData,
      preferences,
      updating,
      avatarUploading,
      loading,
      error,
      toast,
      formErrors,
      avatarInput,
      updateProfile,
      changePassword,
      updatePreferences,
      openAvatarUpload,
      handleAvatarChange,
      retryLoading
    };
  }
};
</script>
<style lang="scss" scoped>
.user-profile-page {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.profile-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.profile-sidebar {
  .profile-avatar-section {
    margin-bottom: 2rem;
    text-align: center;

    .avatar-container {
      position: relative;
      width: 150px;
      height: 150px;
      margin: 0 auto;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid var(--accent-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }

      .profile-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
        }

        .avatar-edit-icon {
          color: white;
          font-size: 1.5rem;
        }
      }
    }

    .avatar-uploading {
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--accent-primary);
        border-top-color: transparent;
        border-radius: 50%;
        margin-right: 0.5rem;
        animation: spin 1s linear infinite;
      }
    }

    .avatar-help-text {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }

  .profile-menu {
    background-color: var(--card-bg);
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .profile-menu-item {
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-primary);
      border-left: 3px solid transparent;

      i {
        margin-right: 0.5rem;
        width: 20px;
        text-align: center;
      }

      &:hover {
        background-color: var(--hover-bg);
      }

      &.active {
        background-color: var(--accent-primary);
        color: white;
        border-left: 3px solid var(--accent-secondary);
      }
    }
  }
}

.profile-content {
  .section-title {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-weight: 600;
    position: relative;
    padding-bottom: 0.5rem;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
      border-radius: 3px;
    }
  }

  .profile-form {
    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
        font-weight: 500;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background-color: var(--input-bg);
        color: var(--text-primary);
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
        }

        &:disabled {
          background-color: var(--disabled-bg);
          cursor: not-allowed;
        }
      }

      .form-text {
        display: block;
        margin-top: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.8rem;
      }

      .error-text {
        display: block;
        margin-top: 0.5rem;
        color: var(--error-color);
        font-size: 0.8rem;
      }

      &.has-error {
        .form-control {
          border-color: var(--error-color);

          &:focus {
            box-shadow: 0 0 0 2px rgba(var(--error-color-rgb), 0.2);
          }
        }
      }

      .checkbox-group,
      .radio-group {
        margin-top: 0.5rem;

        .checkbox-label,
        .radio-label {
          display: block;
          margin-bottom: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: var(--hover-bg);
          }

          input {
            margin-right: 0.5rem;
          }
        }
      }
    }

    .form-actions {
      margin-top: 2rem;

      .button-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-top-color: white;
        border-radius: 50%;
        margin-right: 0.5rem;
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
