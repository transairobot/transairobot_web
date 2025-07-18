<template>
  <AppLayout>
    <!-- Rest of the template remains the same -->
    <AppSection title="Featured Applications" spacing="normal" centered>
      <div class="featured-apps">
        <AppCarousel
          :slides="featuredAppGroups"
          :autoplay="true"
          :autoplaySpeed="5000"
          :showIndicators="true"
        >
          <template #default="{ item }">
            <AppGrid columns="3" gap="normal">
              <AppGridItem v-for="(app, appIndex) in item" :key="appIndex">
                <div class="app-card">
                  <div class="app-icon">{{ app.icon }}</div>
                  <div class="app-badge" v-if="app.badge">{{ app.badge }}</div>
                  <h3>{{ app.title }}</h3>
                  <p>{{ app.description }}</p>
                </div>
              </AppGridItem>
            </AppGrid>
          </template>
        </AppCarousel>
      </div>
    </AppSection>
    <AppSection title="Robot Operating System" background="secondary" spacing="normal">
      <div class="os-section">
        <div class="os-header">
          <h3 class="gradient-text">Develop Once, Run Anywhere</h3>
          <p class="os-tagline">
            Our revolutionary robot operating system enables seamless cross-platform development
          </p>
        </div>

        <div class="os-content">
          <div class="os-image">
            <div class="code-block">
              <pre>
                <code>
// TypeScript Robot App Example
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
                </code>
              </pre>
            </div>
          </div>

          <div class="os-description">
            <p>
              Our robot operating system allows developers to create applications using TypeScript
              and Rust that can be compiled to WebAssembly (WASM) modules, enabling them to run on
              any robot platform that supports our runtime.
            </p>
            <p>
              This "develop once, run anywhere" approach significantly reduces development time and
              allows for greater compatibility across different robot models and manufacturers.
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
              <button class="os-btn primary">Download SDK</button>
              <button class="os-btn secondary">View Documentation</button>
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
      featuredApps: [
        {
          icon: '🤖',
          title: 'Robot Navigation',
          description: 'Advanced navigation system for robots',
          rating: '4.8',
          badge: 'Popular'
        },
        {
          icon: '👁️',
          title: 'Vision System',
          description: 'Computer vision for robot perception',
          rating: '4.6'
        },
        {
          icon: '🦾',
          title: 'Arm Control',
          description: 'Precise control for robotic arms',
          rating: '4.7'
        },
        {
          icon: '🔍',
          title: 'Object Recognition',
          description: 'Identify objects in real-time',
          rating: '4.5'
        },
        {
          icon: '🗣️',
          title: 'Voice Commands',
          description: 'Natural language processing for robots',
          rating: '4.4',
          badge: 'New'
        },
        {
          icon: '🔋',
          title: 'Power Management',
          description: 'Optimize battery usage for longer operation',
          rating: '4.9'
        },
        {
          icon: '🔄',
          title: 'Auto-Update',
          description: 'Keep your robot software up to date',
          rating: '4.3'
        },
        {
          icon: '🛡️',
          title: 'Security Shield',
          description: 'Protect your robot from unauthorized access',
          rating: '4.8',
          badge: 'Featured'
        },
        {
          icon: '📊',
          title: 'Analytics Dashboard',
          description: 'Monitor robot performance metrics',
          rating: '4.7'
        }
      ],
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
  }
};
</script>

<style lang="scss" scoped>
/* Style content remains the same */
</style>
