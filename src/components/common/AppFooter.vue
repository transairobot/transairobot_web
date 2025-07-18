<template>
  <footer class="app-footer">
    <div class="footer-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          fill="currentColor"
          fill-opacity="1"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <div class="logo-container">
            <h3>TransAIRobot</h3>
            <p class="motto">develop once, run anywhere</p>
          </div>
          <p class="company-description">
            TransAIRobot specializes in robot development and robot operating system research,
            creating mobile robotic arm robots and a robot operating system that allows developers
            to use TypeScript and Rust to develop robot applications.
          </p>
          <div class="newsletter">
            <h4>Stay Updated</h4>
            <div class="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email for newsletter"
              />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>Products</h4>
            <ul>
              <li><a href="#">Robot OS</a></li>
              <li><a href="#">Mobile Robots</a></li>
              <li><a href="#">Robotic Arms</a></li>
              <li><a href="#">Developer Tools</a></li>
              <li><a href="#">App Store</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Tutorials</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Licenses</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} TransAIRobot. All rights reserved.</p>
        </div>

        <div class="social-links">
          <a href="#" aria-label="GitHub" class="social-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
              ></path>
            </svg>
          </a>
          <a href="#" aria-label="Twitter" class="social-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
              ></path>
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" class="social-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
              ></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <a href="#" aria-label="YouTube" class="social-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
              ></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>
      </div>

      <div class="theme-toggle-container">
        <ThemeToggle />
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue';
import ThemeToggle from './ThemeToggle.vue';

export default {
  name: 'AppFooter',
  components: {
    ThemeToggle
  },
  setup() {
    const currentYear = computed(() => new Date().getFullYear());

    return {
      currentYear
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-footer {
  background-color: var(--footer-bg);
  color: var(--text-primary);
  padding: $spacing-xl 0;
  margin-top: auto;

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: $spacing-xl;

    .footer-logo {
      flex: 1;
      min-width: 200px;
      margin-bottom: $spacing-lg;

      h3 {
        background: var(--card-border);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: $spacing-sm;
      }

      .motto {
        color: var(--text-secondary);
        font-style: italic;
      }
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      flex: 2;
      justify-content: space-around;

      .link-group {
        margin-bottom: $spacing-lg;
        min-width: 150px;

        h4 {
          margin-bottom: $spacing-md;
          color: var(--text-primary);
        }

        ul {
          list-style: none;

          li {
            margin-bottom: $spacing-sm;

            a {
              color: var(--text-secondary);
              transition: color $transition-fast ease;

              &:hover {
                color: var(--accent-primary);
              }
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-lg;
    border-top: 1px solid var(--input-border);

    p {
      color: var(--text-secondary);
      font-size: $font-size-sm;
    }

    .social-links {
      display: flex;

      a {
        margin-left: $spacing-md;
        color: var(--text-secondary);
        transition: color $transition-fast ease;

        &:hover {
          color: var(--accent-primary);
        }
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .app-footer {
    .footer-content {
      flex-direction: column;
    }

    .footer-bottom {
      flex-direction: column;

      p {
        margin-bottom: $spacing-md;
      }

      .social-links {
        a {
          margin: 0 $spacing-sm;
        }
      }
    }
  }
}
</style>
