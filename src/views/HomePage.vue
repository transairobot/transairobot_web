<template>
  <AppLayout>
    <!-- Rest of the template remains the same -->
    <AppSection title="Featured Applications" spacing="normal" centered>
      <div class="featured-apps">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading featured applications...</p>
        </div>

        <!-- Featured apps carousel -->
        <AppCarousel
          v-if="featuredAppGroups.length > 0"
          :slides="featuredAppGroups"
          :autoplay="true"
          :autoplaySpeed="5000"
          :showIndicators="true"
        >
          <template #default="{ item }">
            <AppGrid columns="3" gap="normal">
              <AppGridItem v-for="(app, appIndex) in item" :key="appIndex">
                <div class="app-card">
                  <div class="app-icon">
                    <img
                      v-if="app.icon && app.icon.startsWith('http')"
                      :src="app.icon"
                      :alt="app.title"
                    />
                    <span v-else>{{ app.icon }}</span>
                  </div>
                  <div class="app-badge" v-if="app.badge">{{ app.badge }}</div>
                  <h3>{{ app.title }}</h3>
                  <p>{{ app.description }}</p>
                </div>
              </AppGridItem>
            </AppGrid>
          </template>
        </AppCarousel>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <p>No featured applications available at the moment.</p>
        </div>
      </div>
    </AppSection>
    <AppSection title="Robot Operating System" spacing="normal">
      <div class="os-container">
        <div class="os-section">
          <div class="os-header">
            <h3 class="gradient-text">Develop Once, Run Anywhere</h3>
            <p class="os-tagline">
              Our revolutionary robot operating system enables seamless cross-platform development
            </p>
          </div>

          <div class="os-content">
            <div class="os-image">
              <div class="code-tabs">
                <button
                  @click="activeCodeExample = 'ts'"
                  :class="{ active: activeCodeExample === 'ts' }"
                >
                  TypeScript
                </button>
                <button
                  @click="activeCodeExample = 'rust'"
                  :class="{ active: activeCodeExample === 'rust' }"
                >
                  Rust
                </button>
              </div>
              <div v-if="activeCodeExample === 'ts'" class="code-block">
                <pre><code>// TypeScript Robot App Example
import { Robot, Sensors, Motion } from 'transai-os';

export class NavigationApp {
  private robot: Robot;
  private sensors: Sensors;
  private motion: Motion;
  
  constructor(robot: Robot) {
    this.robot = robot;
    this.sensors = robot.getSensors();
    this.motion = robot.getMotion();
  }
  
  async navigate(destination: Point): Promise&lt;void&gt; {
    // Implementation works on any robot platform
    // that supports TransAIRobot OS
  }
}
                </code></pre>
              </div>
              <div v-if="activeCodeExample === 'rust'" class="code-block">
                <pre><code>// Rust Robot App Example
use transai_os::{Robot, Sensors, Motion, Point};

pub struct NavigationApp {
    sensors: Sensors,
    motion: Motion,
}

impl NavigationApp {
    pub fn new(robot: &Robot) -> Self {
        Self {
            sensors: robot.get_sensors(),
            motion: robot.get_motion(),
        }
    }

    pub async fn navigate(&self, dest: Point) {
        // Implementation works on any robot platform
        // that supports TransAIRobot OS
    }
}
                </code></pre>
              </div>
            </div>

            <div class="os-description">
              <p>
                Our robot operating system allows developers to create applications using TypeScript
                and Rust that can be compiled to WebAssembly (WASM) modules, enabling them to run on
                any robot platform that supports our runtime.
              </p>
              <p>
                This "develop once, run anywhere" approach significantly reduces development time
                and allows for greater compatibility across different robot models and
                manufacturers.
              </p>

              <AppGrid columns="3" gap="normal" class="info-features">
                <AppGridItem v-for="(feature, index) in osFeatures" :key="index">
                  <div class="feature">
                    <h4>{{ feature.title }}</h4>
                    <p>{{ feature.description }}</p>
                  </div>
                </AppGridItem>
              </AppGrid>

              <div class="os-cta">
                <button class="os-btn secondary">View Documentation</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>
  </AppLayout>
</template>

<script>
import AppLayout from '../components/common/AppLayout.vue';
import AppSection from '../components/common/AppSection.vue';
import AppGrid from '../components/common/AppGrid.vue';
import AppGridItem from '../components/common/AppGridItem.vue';
import AppCarousel from '../components/common/AppCarousel.vue';
import applicationStoreService from '../services/application-store.service';

export default {
  name: 'HomePage',
  components: {
    AppLayout,
    AppSection,
    AppGrid,
    AppGridItem,
    AppCarousel
  },
  data() {
    return {
      activeCodeExample: 'ts',
      featuredApps: [],
      loading: false,
      error: null,
      osFeatures: [
        {
          title: 'TypeScript & Rust Support',
          description: 'Use modern languages for robot application development'
        },
        {
          title: 'Cross-Platform Compatibility',
          description: 'Applications work across different robot platforms'
        },
        {
          title: 'WebAssembly Powered',
          description: 'High-performance execution in a secure sandbox'
        }
      ]
    };
  },
  computed: {
    // Group apps into sets of 3 for carousel slides
    featuredAppGroups() {
      const groups = [];
      const appsPerGroup = 3;

      for (let i = 0; i < this.featuredApps.length; i += appsPerGroup) {
        groups.push(this.featuredApps.slice(i, i + appsPerGroup));
      }

      return groups;
    }
  },
  async mounted() {
    await this.fetchFeaturedApps();
  },
  methods: {
    async fetchFeaturedApps() {
      this.loading = true;
      this.error = null;

      try {
        const response = await applicationStoreService.getFeaturedApplications();
        console.log('Featured apps response:', response);

        // Handle different response formats
        let apps = response;

        // If response is an object with numeric keys (transformed array), convert back to array
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const keys = Object.keys(response);
          if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
            apps = Object.values(response);
          }
        }

        // Ensure apps is an array
        if (!Array.isArray(apps)) {
          apps = [];
        }

        // Transform API data to match the expected format for the carousel
        this.featuredApps = apps.map(app => ({
          icon: app.iconUrl || '🤖', // Use iconUrl from API or fallback to default icon
          title: app.name,
          description: app.description,
          rating: app.rating ? app.rating.toFixed(1) : '0.0',
          badge: this.getAppBadge(app), // Determine badge based on app properties
          id: app.id // Keep the ID for potential navigation
        }));

        // If no apps are returned, don't show error - just show empty state
        if (this.featuredApps.length === 0) {
          console.log('No featured applications found');
        }
      } catch (error) {
        console.error('Failed to fetch featured applications:', error);
        // 静默处理错误，不设置错误状态
        // Keep featuredApps as empty array to avoid breaking the UI
        this.featuredApps = [];
      } finally {
        this.loading = false;
      }
    },

    getAppBadge(app) {
      // Logic to determine badge based on app properties
      // This can be customized based on your backend data structure
      if (app.featured) return 'Featured';
      if (app.isNew) return 'New';
      if (app.popular) return 'Popular';
      return null;
    }
  }
};
</script>

<style lang="scss" scoped>
.featured-apps,
.os-container {
  padding: 3rem;
  border-radius: 1rem;
  background-color: var(--bg-secondary);
  box-shadow: 0 10px 30px -15px rgba(var(--accent-primary-rgb), 0.2),
    0 -10px 30px -15px rgba(var(--accent-secondary-rgb), 0.2);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 20px 40px -15px rgba(var(--accent-primary-rgb), 0.3),
      0 -20px 40px -15px rgba(var(--accent-secondary-rgb), 0.3);
  }
}

.app-card {
  background-color: var(--card-bg);
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 2rem 1.5rem; // 增加上下padding
  border-radius: 0.75rem;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px; // 设置最小高度，让卡片更饱满
  height: 90%; /* Ensure card takes full height of grid item */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0.75rem;
    padding: 2px;
    background: var(--card-border);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover {
    transform: translateY(-5px);

    &::before {
      opacity: 1;
    }
  }

  .app-icon {
    font-size: 3.5rem; // 从 2.5rem 增加到 3.5rem
    margin-bottom: 1.2rem; // 稍微增加底部间距
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .app-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--accent-primary);
    color: var(--button-text);
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: bold;
  }

  h3 {
    margin: 0.5rem 0;
    font-size: 1.5rem; // 从 1.25rem 增加到 1.5rem
    font-weight: 600; // 增加字体粗细
    color: var(--text-primary);
    text-align: center; // 居中对齐
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4; // 增加行高让文字更易读
    margin-top: 0.75rem; // 增加与标题的间距
    flex-grow: 1; /* Allow description to take up available space */
  }
}

.code-tabs {
  display: flex;
  margin-bottom: -1px;

  button {
    background: transparent;
    border: 1px solid var(--divider);
    border-bottom: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: 0.5rem 0.5rem 0 0;
    margin-right: 0.25rem;
    position: relative;
    bottom: -1px;

    &.active {
      background: var(--code-bg);
      color: var(--text-primary);
      border-bottom: 1px solid var(--code-bg);
    }
  }
}

.code-block {
  border: 1px solid var(--divider);
  border-radius: 0 0.5rem 0.5rem 0.5rem;
}

.os-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border: 2px solid transparent;

  &.primary {
    background: var(--button-bg);
    color: var(--button-text);
    border-color: transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: var(--accent-primary);
    border-color: var(--accent-primary);

    &:hover {
      background: rgba(var(--accent-primary-rgb), 0.1);
      transform: translateY(-2px);
    }
  }
}

.os-description p + p {
  margin-top: 1.5rem;
}

.os-description > p {
  text-indent: 2em;
}

.info-features {
  margin-top: 2.5rem;
}

.os-cta {
  margin-top: 2.5rem;
}

// Loading, error, and empty states for featured apps
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-state {
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--bg-tertiary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
}

.error-state {
  .retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--accent-primary);
    color: var(--button-text);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: var(--accent-primary-hover);
      transform: translateY(-1px);
    }
  }
}

.app-icon {
  img {
    width: 3.5rem; // 从 2.5rem 增加到 3.5rem
    height: 3.5rem; // 从 2.5rem 增加到 3.5rem
    object-fit: cover;
    border-radius: 0.75rem; // 稍微增加圆角
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
