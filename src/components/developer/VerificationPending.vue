<template>
  <div class="verification-pending">
    <div class="verification-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h2>Verification Pending</h2>
    <p class="verification-message">
      Your developer application has been submitted and is currently under review. 
      This process typically takes 1-3 business days.
    </p>
    <div class="verification-details">
      <h3>What happens next?</h3>
      <ol>
        <li>Our team will review your application</li>
        <li>You may be contacted for additional information</li>
        <li>Once approved, you'll receive an email notification</li>
        <li>You'll then have full access to the developer portal</li>
      </ol>
      
      <h3>While you wait</h3>
      <p>You can prepare for development by:</p>
      <ul>
        <li>Reading our <a href="#">developer documentation</a></li>
        <li>Setting up your development environment</li>
        <li>Exploring our <a href="#">API reference</a></li>
      </ul>
    </div>
    <div class="verification-actions">
      <AppButton variant="secondary" @click="goHome">Return to Home</AppButton>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import AppButton from '../common/AppButton.vue';

export default {
  name: 'VerificationPending',
  components: {
    AppButton
  },
  setup() {
    const router = useRouter();
    
    const goHome = () => {
      router.push('/');
    };
    
    return {
      goHome
    };
  }
};
</script>

<style lang="scss" scoped>
.verification-pending {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem 1rem;
  
  .verification-icon {
    margin-bottom: 1.5rem;
    color: var(--accent-primary);
    
    svg {
      width: 80px;
      height: 80px;
    }
  }
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .verification-message {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: var(--text-secondary);
  }
  
  .verification-details {
    text-align: left;
    background: var(--bg-secondary);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    
    h3 {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      font-size: 1.25rem;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    ol, ul {
      padding-left: 1.5rem;
      margin-bottom: 1.5rem;
      
      li {
        margin-bottom: 0.5rem;
      }
    }
  }
  
  .verification-actions {
    margin-top: 2rem;
  }
}
</style>