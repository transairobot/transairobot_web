<template>
  <div class="component-demo">
    <h2>UI Components Demo</h2>

    <section class="demo-section">
      <h3>AppButton Variants</h3>
      <div class="button-container">
        <app-button variant="primary">Primary Button</app-button>
        <app-button variant="secondary">Secondary Button</app-button>
        <app-button variant="outline">Outline Button</app-button>
        <app-button variant="text">Text Button</app-button>
        <app-button variant="primary" disabled>Disabled Button</app-button>
      </div>
    </section>

    <section class="demo-section">
      <h3>AppCard Variants</h3>
      <div class="card-container">
        <app-card hoverable>
          <h4>Default Card</h4>
          <p>This is a default card with hover effect.</p>
        </app-card>

        <app-card variant="primary" hoverable>
          <h4>Primary Card</h4>
          <p>This is a primary card with hover effect.</p>
        </app-card>

        <app-card variant="secondary" hoverable>
          <h4>Secondary Card</h4>
          <p>This is a secondary card with hover effect.</p>
        </app-card>

        <app-card variant="outline" hoverable>
          <h4>Outline Card</h4>
          <p>This is an outline card with hover effect.</p>
        </app-card>
      </div>
    </section>

    <section class="demo-section">
      <h3>Loading States</h3>
      <div class="loading-container">
        <div>
          <h4>Ring Spinner</h4>
          <loading-state variant="ring" message="Loading data..." />
        </div>

        <div>
          <h4>Futuristic Spinner</h4>
          <loading-state variant="futuristic" message="Processing request..." />
        </div>

        <div>
          <h4>Dots Spinner</h4>
          <loading-state variant="dots" message="Please wait..." />
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h3>Error States</h3>
      <div class="error-container">
        <error-state
          title="Default Error"
          message="Something went wrong while processing your request."
          details="Error code: 500 - Internal Server Error"
        />

        <error-state
          variant="warning"
          title="Warning"
          message="Your session is about to expire. Please save your work."
          :showRetry="false"
          :showHome="true"
        />

        <error-state
          variant="critical"
          title="Critical Error"
          message="Unable to connect to the server. Please check your internet connection."
        />

        <error-state
          variant="network"
          title="Network Error"
          message="Unable to reach the API endpoint."
        />
      </div>
    </section>
  </div>
</template>

<script>
import AppButton from './AppButton.vue';
import AppCard from './AppCard.vue';
import LoadingState from './LoadingState.vue';
import ErrorState from './ErrorState.vue';

export default {
  name: 'ComponentDemo',
  components: {
    AppButton,
    AppCard,
    LoadingState,
    ErrorState
  }
};
</script>

<style lang="scss" scoped>
.component-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .demo-section {
    margin-bottom: 3rem;

    h3 {
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--divider);
    }
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .loading-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;

    h4 {
      margin-bottom: 1rem;
      text-align: center;
    }
  }

  .error-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .component-demo {
    padding: 1rem;
  }

  .card-container,
  .loading-container {
    grid-template-columns: 1fr;
  }
}
</style>
