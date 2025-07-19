<template>
  <div class="developer-dashboard">
    <div class="dashboard-header">
      <h2>Developer Dashboard</h2>
      <div class="dashboard-actions">
        <AppButton @click="navigateToSubmitApp" variant="primary">Submit New Application</AppButton>
      </div>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalApps }}</div>
        <div class="stat-label">Total Applications</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.publishedApps }}</div>
        <div class="stat-label">Published</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.pendingApps }}</div>
        <div class="stat-label">Pending Review</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalDownloads }}</div>
        <div class="stat-label">Total Downloads</div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="dashboard-section">
        <div class="section-header">
          <h3>Your Applications</h3>
          <div class="section-actions">
            <select v-model="filters.status" class="filter-select">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
            <select v-model="filters.sortBy" class="filter-select">
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="downloads">Sort by Downloads</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <LoadingState message="Loading your applications..." />
        </div>
        
        <div v-else-if="filteredApps.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <h4>No Applications Found</h4>
          <p>You haven't submitted any applications yet or none match your current filters.</p>
          <AppButton @click="navigateToSubmitApp" variant="primary">Submit Your First Application</AppButton>
        </div>
        
        <div v-else class="app-grid">
          <AppCard 
            v-for="app in filteredApps" 
            :key="app.id" 
            class="app-card"
            hoverable
            @click="viewAppDetails(app.id)"
          >
            <div class="app-item">
              <div class="app-icon">
                <img :src="app.icon" :alt="app.name" />
                <div class="app-status" :class="`status-${app.status}`">
                  {{ getStatusLabel(app.status) }}
                </div>
              </div>
              <div class="app-info">
                <h4 class="app-name">{{ app.name }}</h4>
                <p class="app-description">{{ app.description }}</p>
                <div class="app-meta">
                  <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {{ app.downloads }} downloads
                  </div>
                  <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    {{ app.rating.toFixed(1) }}
                  </div>
                  <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ formatDate(app.lastUpdated) }}
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '../common/AppButton.vue';
import AppCard from '../common/AppCard.vue';
import LoadingState from '../common/LoadingState.vue';

export default {
  name: 'DeveloperDashboard',
  components: {
    AppButton,
    AppCard,
    LoadingState
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    
    const stats = reactive({
      totalApps: 0,
      publishedApps: 0,
      pendingApps: 0,
      totalDownloads: 0
    });
    
    const filters = reactive({
      status: 'all',
      sortBy: 'date'
    });
    
    const apps = ref([]);
    
    const filteredApps = computed(() => {
      let result = [...apps.value];
      
      // Apply status filter
      if (filters.status !== 'all') {
        result = result.filter(app => app.status === filters.status);
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'downloads':
          result.sort((a, b) => b.downloads - a.downloads);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'date':
        default:
          result.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
          break;
      }
      
      return result;
    });
    
    const navigateToSubmitApp = () => {
      router.push('/developer/submit-app');
    };
    
    const viewAppDetails = (appId) => {
      router.push(`/developer/apps/${appId}`);
    };
    
    const getStatusLabel = (status) => {
      const statusMap = {
        'published': 'Published',
        'pending': 'In Review',
        'rejected': 'Rejected',
        'draft': 'Draft'
      };
      return statusMap[status] || status;
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    const fetchDeveloperApps = () => {
      // This would be replaced with an actual API call
      // Simulating API call with setTimeout
      setTimeout(() => {
        // Mock data
        const mockApps = [
          {
            id: '1',
            name: 'Robot Navigation Assistant',
            description: 'Helps robots navigate complex environments with advanced pathfinding algorithms.',
            icon: '/assets/images/app-icons/navigation.png',
            status: 'published',
            downloads: 1245,
            rating: 4.7,
            lastUpdated: '2025-06-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Voice Command Processor',
            description: 'Process natural language voice commands for robot control.',
            icon: '/assets/images/app-icons/voice.png',
            status: 'pending',
            downloads: 0,
            rating: 0,
            lastUpdated: '2025-07-10T14:20:00Z'
          },
          {
            id: '3',
            name: 'Environment Scanner',
            description: 'Advanced environment scanning and mapping capabilities.',
            icon: '/assets/images/app-icons/scanner.png',
            status: 'draft',
            downloads: 0,
            rating: 0,
            lastUpdated: '2025-07-05T09:15:00Z'
          }
        ];
        
        apps.value = mockApps;
        
        // Update stats
        stats.totalApps = mockApps.length;
        stats.publishedApps = mockApps.filter(app => app.status === 'published').length;
        stats.pendingApps = mockApps.filter(app => app.status === 'pending').length;
        stats.totalDownloads = mockApps.reduce((sum, app) => sum + app.downloads, 0);
        
        loading.value = false;
      }, 1000);
    };
    
    onMounted(() => {
      fetchDeveloperApps();
    });
    
    return {
      loading,
      stats,
      filters,
      apps,
      filteredApps,
      navigateToSubmitApp,
      viewAppDetails,
      getStatusLabel,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.developer-dashboard {
  width: 100%;
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h2 {
      margin: 0;
      font-size: 1.75rem;
    }
  }
  
  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    
    .stat-card {
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
      }
      
      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }
      
      .stat-label {
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }
  
  .dashboard-content {
    .dashboard-section {
      margin-bottom: 3rem;
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        
        h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        
        .section-actions {
          display: flex;
          gap: 0.75rem;
          
          .filter-select {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            font-size: 0.9rem;
            
            &:focus {
              outline: none;
              border-color: var(--accent-primary);
            }
          }
        }
      }
      
      .app-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        
        .app-card {
          height: 100%;
        }
        
        .app-item {
          display: flex;
          flex-direction: column;
          height: 100%;
          
          .app-icon {
            position: relative;
            margin-bottom: 1rem;
            
            img {
              width: 100%;
              height: 150px;
              object-fit: cover;
              border-radius: 0.5rem;
            }
            
            .app-status {
              position: absolute;
              top: 0.75rem;
              right: 0.75rem;
              padding: 0.25rem 0.75rem;
              border-radius: 1rem;
              font-size: 0.75rem;
              font-weight: 600;
              
              &.status-published {
                background-color: rgba(var(--success-rgb), 0.2);
                color: var(--success-color);
              }
              
              &.status-pending {
                background-color: rgba(var(--warning-rgb), 0.2);
                color: var(--warning-color);
              }
              
              &.status-rejected {
                background-color: rgba(var(--error-rgb), 0.2);
                color: var(--error-color);
              }
              
              &.status-draft {
                background-color: rgba(var(--info-rgb), 0.2);
                color: var(--info-color);
              }
            }
          }
          
          .app-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            
            .app-name {
              margin: 0 0 0.5rem;
              font-size: 1.1rem;
            }
            
            .app-description {
              color: var(--text-secondary);
              font-size: 0.9rem;
              margin-bottom: 1rem;
              flex: 1;
            }
            
            .app-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 1rem;
              margin-top: auto;
              
              .meta-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: var(--text-tertiary);
                font-size: 0.8rem;
                
                svg {
                  color: var(--text-tertiary);
                }
              }
            }
          }
        }
      }
      
      .loading-container {
        display: flex;
        justify-content: center;
        padding: 3rem 0;
      }
      
      .empty-state {
        text-align: center;
        padding: 3rem 0;
        
        .empty-icon {
          margin-bottom: 1rem;
          color: var(--text-tertiary);
        }
        
        h4 {
          margin-bottom: 0.5rem;
        }
        
        p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }
      }
    }
  }
}
</style>