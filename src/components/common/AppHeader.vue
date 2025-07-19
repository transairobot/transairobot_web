<template>
  <header class="app-header" :class="{ 'app-header--scrolled': isScrolled }">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <span class="logo-text">TransAIRobot</span>
            <span class="logo-tagline">develop once, run anywhere</span>
          </router-link>
        </div>

        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav class="main-nav" :class="{ 'main-nav--open': isMobileMenuOpen }">
          <ul>
            <li><router-link to="/" @click="closeMobileMenu">Home</router-link></li>
            <li><router-link to="/app-store" @click="closeMobileMenu">App Store</router-link></li>
            <li><router-link to="/my-robots" @click="closeMobileMenu">My Robots</router-link></li>
            <li><router-link to="/developer" @click="closeMobileMenu">Developer</router-link></li>
            <li>
              <router-link to="/documentation" @click="closeMobileMenu">Documentation</router-link>
            </li>
            <li v-if="isAdmin">
              <router-link to="/admin/documentation" @click="closeMobileMenu"
                >Docs Admin</router-link
              >
            </li>
            <li class="mobile-only">
              <div class="mobile-theme-toggle">
                <span>Theme:</span>
                <ThemeToggle />
              </div>
            </li>
          </ul>
        </nav>

        <div class="header-actions">
          <ThemeToggle class="desktop-only" />

          <div v-if="!isAuthenticated" class="auth-buttons">
            <router-link to="/login" class="login-btn">Login</router-link>
            <router-link to="/register" class="register-btn">Register</router-link>
          </div>

          <div v-else class="user-menu" @click="toggleUserDropdown" ref="userMenuRef">
            <div class="user-avatar">
              <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
              <span v-else>{{ userInitials }}</span>
            </div>
            <span class="user-name desktop-only">{{ userName }}</span>
            <span class="dropdown-arrow desktop-only"></span>

            <div class="user-dropdown" v-if="isUserDropdownOpen">
              <div class="dropdown-header">
                <strong>{{ userName }}</strong>
                <span>{{ userEmail }}</span>
              </div>
              <ul class="dropdown-menu">
                <li><router-link to="/profile" @click="closeUserDropdown">Profile</router-link></li>
                <li>
                  <router-link to="/settings" @click="closeUserDropdown">Settings</router-link>
                </li>
                <li v-if="isAdmin">
                  <router-link to="/admin" @click="closeUserDropdown">Admin</router-link>
                </li>
                <li class="dropdown-divider"></li>
                <li><button @click="logout" class="logout-btn">Logout</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-menu-backdrop" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';

export default {
  name: 'AppHeader',
  components: {
    ThemeToggle
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const isScrolled = ref(false);
    const isMobileMenuOpen = ref(false);
    const isUserDropdownOpen = ref(false);
    const userMenuRef = ref(null);

    const currentTheme = computed(() => store.getters.currentTheme);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const isAdmin = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user && user.role === 'admin';
    });

    const userName = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? user.nickname : '';
    });

    const userEmail = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? user.email : '';
    });

    const userAvatar = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user && user.avatar ? user.avatar : '';
    });

    const userInitials = computed(() => {
      if (!userName.value) return '';
      return userName.value
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    });

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 20;
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      if (isMobileMenuOpen.value) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      document.body.classList.remove('no-scroll');
    };

    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value;
    };

    const closeUserDropdown = () => {
      isUserDropdownOpen.value = false;
    };

    const handleClickOutside = event => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        isUserDropdownOpen.value = false;
      }
    };

    const logout = () => {
      store.dispatch('auth/logout');
      closeUserDropdown();
      router.push('/');
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('click', handleClickOutside);
      handleScroll(); // Check initial scroll position
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      document.body.classList.remove('no-scroll');
    });

    // Close mobile menu on route change
    watch(
      () => router.currentRoute.value.path,
      () => {
        closeMobileMenu();
      }
    );

    return {
      currentTheme,
      isAuthenticated,
      isAdmin,
      userName,
      userEmail,
      userAvatar,
      userInitials,
      isScrolled,
      isMobileMenuOpen,
      isUserDropdownOpen,
      userMenuRef,
      toggleMobileMenu,
      closeMobileMenu,
      toggleUserDropdown,
      closeUserDropdown,
      logout
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.app-header {
  background-color: var(--header-bg);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  transition: all $transition-normal ease;

  &--scrolled {
    background-color: var(--header-bg-scrolled, var(--header-bg));
    box-shadow: var(--shadow-lg);

    .logo-tagline {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: relative;
  }

  .logo {
    display: flex;
    flex-direction: column;
    z-index: 20;

    a {
      display: flex;
      flex-direction: column;
      text-decoration: none;
    }

    .logo-text {
      font-size: $font-size-xl;
      font-weight: 700;
      background: var(--card-border);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all $transition-normal ease;
    }

    .logo-tagline {
      font-size: $font-size-xs;
      color: var(--text-secondary);
      font-style: italic;
      transition: all $transition-normal ease;
      opacity: 1;
      transform: translateY(0);
    }

    &:hover {
      .logo-text {
        opacity: 0.8;
      }
    }
  }

  .mobile-menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 20;

    .bar {
      height: 3px;
      width: 100%;
      background-color: var(--text-primary);
      border-radius: 3px;
      transition: all 0.3s ease;
    }
  }

  .main-nav {
    ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        margin: 0 $spacing-md;

        a {
          display: block;
          padding: $spacing-xs 0;
          color: var(--text-primary);
          font-weight: 500;
          transition: color $transition-fast ease;
          position: relative;
          text-decoration: none;

          &:hover,
          &.router-link-active {
            color: var(--accent-primary);

            &:after {
              width: 100%;
            }
          }

          &:after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--card-border);
            transition: width $transition-normal ease;
          }
        }
      }
    }

    .mobile-only {
      display: none;
    }

    .mobile-theme-toggle {
      display: flex;
      align-items: center;
      margin-top: $spacing-lg;
      padding: $spacing-md;
      border-top: 1px solid var(--divider);

      span {
        margin-right: $spacing-md;
        color: var(--text-secondary);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;

    .auth-buttons {
      display: flex;
      align-items: center;

      .login-btn {
        color: var(--accent-primary);
        font-weight: 500;
        margin-right: $spacing-md;
        padding: $spacing-xs $spacing-sm;
        border-radius: $border-radius-md;
        transition: all $transition-fast ease;
        text-decoration: none;

        &:hover {
          background-color: rgba(var(--accent-primary-rgb), 0.1);
        }
      }

      .register-btn {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: var(--text-on-accent);
        padding: $spacing-xs $spacing-md;
        border-radius: $border-radius-md;
        font-weight: 500;
        transition: all $transition-fast ease;
        text-decoration: none;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
      padding: $spacing-xs;
      border-radius: $border-radius-md;
      transition: background-color $transition-fast ease;

      &:hover {
        background-color: var(--bg-hover);
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-on-accent);
        font-weight: 600;
        font-size: $font-size-sm;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .user-name {
        margin: 0 $spacing-sm;
        font-weight: 500;
      }

      .dropdown-arrow {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid var(--text-secondary);
        margin-left: $spacing-xs;
        transition: transform $transition-fast ease;
      }

      .user-dropdown {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        width: 220px;
        background-color: var(--bg-secondary);
        border-radius: $border-radius-md;
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        z-index: 30;
        animation: dropdown-fade 0.2s ease;

        .dropdown-header {
          padding: $spacing-md;
          border-bottom: 1px solid var(--divider);
          display: flex;
          flex-direction: column;

          strong {
            color: var(--text-primary);
            margin-bottom: $spacing-xs;
          }

          span {
            color: var(--text-secondary);
            font-size: $font-size-sm;
            word-break: break-all;
          }
        }

        .dropdown-menu {
          list-style: none;
          padding: $spacing-xs 0;
          margin: 0;

          li {
            a,
            button {
              display: flex;
              padding: $spacing-sm $spacing-md;
              color: var(--text-primary);
              text-decoration: none;
              transition: background-color $transition-fast ease;
              width: 100%;
              text-align: left;
              font-size: $font-size-md;
              border: none;
              background: none;
              cursor: pointer;

              &:hover {
                background-color: var(--bg-hover);
                color: var(--accent-primary);
              }
            }

            &.dropdown-divider {
              height: 1px;
              background-color: var(--divider);
              margin: $spacing-xs 0;
            }

            .logout-btn {
              color: var(--error-color);

              &:hover {
                background-color: rgba(var(--error-color-rgb), 0.1);
                color: var(--error-color);
              }
            }
          }
        }
      }
    }
  }

  .mobile-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
    animation: backdrop-fade 0.3s ease;
  }

  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }
}

@media (max-width: $breakpoint-md) {
  .app-header {
    .mobile-menu-toggle {
      display: flex;
    }

    .main-nav {
      position: fixed;
      top: 0;
      right: -300px;
      width: 280px;
      height: 100vh;
      background-color: var(--bg-secondary);
      box-shadow: var(--shadow-lg);
      z-index: 15;
      transition: right 0.3s ease;
      padding: 80px $spacing-md $spacing-md;
      overflow-y: auto;

      &--open {
        right: 0;
      }

      ul {
        flex-direction: column;

        li {
          margin: $spacing-xs 0;

          a {
            padding: $spacing-sm 0;
            font-size: $font-size-lg;

            &:after {
              display: none;
            }
          }
        }
      }

      .mobile-only {
        display: block;
      }
    }

    .header-actions {
      .desktop-only {
        display: none;
      }

      .auth-buttons {
        .login-btn {
          margin-right: $spacing-sm;
        }

        .register-btn {
          padding: $spacing-xs $spacing-sm;
        }
      }

      .user-menu {
        .user-name,
        .dropdown-arrow {
          display: none;
        }
      }
    }
  }

  .no-scroll {
    overflow: hidden;
  }
}

@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes backdrop-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
