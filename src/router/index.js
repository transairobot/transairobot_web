import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/app-store',
    name: 'AppStore',
    component: () => import('../views/AppStorePage.vue')
  },
  {
    path: '/app/:id',
    name: 'AppDetail',
    component: () => import('../views/AppDetailPage.vue')
  },
  {
    path: '/my-robots',
    name: 'MyRobots',
    component: () => import('../views/MyRobotsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/robot/:id',
    name: 'RobotDetail',
    component: () => import('../views/RobotDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/developer',
    name: 'DeveloperPortal',
    component: () => import('../views/DeveloperPortalPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/developer/submit-app',
    name: 'AppSubmission',
    component: () => import('../views/AppSubmissionPage.vue'),
    meta: { requiresAuth: true, developerRequired: true }
  },
  {
    path: '/developer/verification',
    name: 'DeveloperVerification',
    component: () => import('../views/DeveloperVerificationPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboardPage.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/review',
    name: 'AdminAppReview',
    component: () => import('../views/AdminAppReviewPage.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/store',
    name: 'AdminStoreManagement',
    component: () => import('../views/AdminStoreManagementPage.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
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
