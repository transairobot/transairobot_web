<template>
  <div class="auth-layout">
    <header class="auth-header">
      <router-link to="/">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
      </router-link>
    </header>
    <main class="auth-main">
      <div class="auth-card">
        <slot></slot>
      </div>
    </main>
    <footer class="auth-footer">
      <div class="footer-links">
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Policy</a>
      </div>
      <div class="copyright">
        &copy; {{ new Date().getFullYear() }} TransAIRobot. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-primary);
}

.auth-header {
  padding: $spacing-lg;
  .logo {
    height: 40px;
  }
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: $spacing-2xl;
  background-color: var(--background-secondary);
  border-radius: $border-radius-lg;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-footer {
  padding: $spacing-lg;
  text-align: center;
  color: var(--text-secondary);
  font-size: $font-size-sm;

  .footer-links {
    margin-bottom: $spacing-md;
    a {
      color: var(--text-secondary);
      margin: 0 $spacing-sm;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
