import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import { lazyLoadView } from '@/utils/lazyLoad';

// Initialize auth state from localStorage
const initializeAuth = async () => {
  // If we have a token but no user data, try to fetch the user profile
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && !user) {
    try {
      await store.dispatch('auth/fetchCurrentUser');
    } catch (error) {
      // If fetching user fails, clear the token
      store.dispatch('auth/logout');
    }
  }
};

// Call initialization
initializeAuth();

const routes = [
  {
    path: '/',
    name: 'Home',
    component: lazyLoadView('HomePage')
  },
  {
    path: '/login',
    name: 'Login',
    component: lazyLoadView('LoginPage'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: lazyLoadView('RegisterPage'),
    meta: { guestOnly: true }
  },
  {
    path: '/app-store',
    name: 'AppStore',
    component: lazyLoadView('AppStorePage')
  },
  {
    path: '/app/:id',
    name: 'AppDetail',
    component: lazyLoadView('AppDetailPage')
  },
  {
    path: '/robots',
    name: 'MyRobots',
    component: lazyLoadView('MyRobotsPage'),
    meta: { requiresAuth: true }
  },
  {
    path: '/robots/:id',
    name: 'RobotDetail',
    component: lazyLoadView('RobotDetailPage'),
    meta: { requiresAuth: true }
  },
  {
    path: '/developer',
    name: 'DeveloperPortal',
    component: lazyLoadView('DeveloperPortalPage'),
    meta: { requiresAuth: true }
  },
  {
    path: '/developer/submit-app',
    name: 'AppSubmission',
    component: lazyLoadView('AppSubmissionPage'),
    meta: { requiresAuth: true, developerRequired: true }
  },
  {
    path: '/developer/verification',
    name: 'DeveloperVerification',
    component: lazyLoadView('DeveloperVerificationPage'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: lazyLoadView('UserProfilePage'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: lazyLoadView('ForgotPasswordPage'),
    meta: { guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: lazyLoadView('ResetPasswordPage'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: lazyLoadView('AdminDashboardPage'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/review',
    name: 'AdminAppReview',
    component: lazyLoadView('AdminAppReviewPage'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/store',
    name: 'AdminStoreManagement',
    component: lazyLoadView('AdminStoreManagementPage'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  // Scroll behavior for better UX
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const userRole = store.getters['auth/userRole'];
  const currentUser = store.getters['auth/currentUser'];

  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // Check role-based access
    if (to.matched.some(record => record.meta.roles && record.meta.roles.length)) {
      if (!to.meta.roles.includes(userRole)) {
        next({ name: 'Home' });
        return;
      }
    }

    // Check if developer access is required
    if (to.matched.some(record => record.meta.developerRequired)) {
      const isDeveloper =
        currentUser &&
        (currentUser.role === 'developer' ||
          currentUser.role === 'admin' ||
          currentUser.developerStatus === 'approved');

      if (!isDeveloper) {
        next({ name: 'DeveloperPortal' });
        return;
      }
    }
  }

  // Routes for guests only (like login, register)
  if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuthenticated) {
      next({ name: 'Home' });
      return;
    }
  }

  next();
});

export default router;
