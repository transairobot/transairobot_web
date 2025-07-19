<template>
  <div class="documentation-page">
    <DocumentationSidebar
      :currentDocId="currentDocId"
      :versions="versions"
      :currentVersion="currentVersion"
      @select-document="navigateToDocument"
      @version-change="changeVersion"
    />

    <DocumentationContent
      :document="currentDocument"
      :isLoading="isLoading"
      @edit-document="navigateToEditor"
    />
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import DocumentationSidebar from '@/components/documentation/DocumentationSidebar.vue';
import DocumentationContent from '@/components/documentation/DocumentationContent.vue';

export default defineComponent({
  name: 'DocumentationPage',

  components: {
    DocumentationSidebar,
    DocumentationContent
  },

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    // Get parameters from route
    const currentDocId = computed(() => route.params.documentId);
    const currentCategoryId = computed(() => route.params.categoryId);
    const currentVersionId = computed(() => route.params.versionId);
    const errorMessage = computed(() => route.query.error);

    // Get data from store
    const currentDocument = computed(() => store.getters['documentation/currentDocument']);
    const versions = computed(() => store.getters['documentation/allVersions']);
    const currentVersion = computed(() => store.getters['documentation/currentVersion']);
    const isLoading = computed(() => store.getters['documentation/isLoading']);

    // Initialize data
    onMounted(async () => {
      try {
        // Show error message if present
        if (errorMessage.value) {
          store.dispatch('notification/show', {
            type: 'error',
            message: errorMessage.value
          });
        }

        // Fetch versions first
        await store.dispatch('documentation/fetchVersions');

        // Set version if specified in route
        if (currentVersionId.value) {
          const version = versions.value.find(v => v.id === currentVersionId.value);
          if (version) {
            await store.dispatch('documentation/setCurrentVersion', version);
          }
        }

        // Then fetch categories
        await store.dispatch('documentation/fetchCategories');

        // Then fetch documents for the current version
        await store.dispatch('documentation/fetchDocuments');

        // If there's a document ID in the route, load that document
        if (currentDocId.value) {
          await store.dispatch('documentation/fetchDocumentById', currentDocId.value);
        }
      } catch (error) {
        console.error('Error initializing documentation page:', error);
      }
    });

    // Watch for changes in the route params to load the correct document
    watch(
      () => route.params.documentId,
      async newDocId => {
        if (newDocId) {
          try {
            await store.dispatch('documentation/fetchDocumentById', newDocId);
          } catch (error) {
            console.error('Error loading document:', error);
          }
        }
      }
    );

    // Navigate to a document
    const navigateToDocument = (documentId, categoryId = null) => {
      if (categoryId) {
        router.push({
          name: 'DocumentationCategoryDetail',
          params: { documentId, categoryId }
        });
      } else {
        router.push({
          name: 'DocumentationDetail',
          params: { documentId }
        });
      }
    };

    // Change version
    const changeVersion = async version => {
      try {
        await store.dispatch('documentation/setCurrentVersion', version);

        // Navigate to version-specific route
        router.push({
          name: 'DocumentationVersion',
          params: { versionId: version.id }
        });

        // If there's a current document, try to find the same document in the new version
        if (currentDocument.value) {
          const documents = store.getters['documentation/allDocuments'];
          const sameDocument = documents.find(
            doc =>
              doc.title === currentDocument.value.title || doc.slug === currentDocument.value.slug
          );

          if (sameDocument) {
            navigateToDocument(sameDocument.id);
          }
        }
      } catch (error) {
        console.error('Error changing version:', error);
      }
    };

    // Navigate to editor (admin only)
    const navigateToEditor = documentId => {
      router.push({
        name: 'DocumentationEditor',
        params: { documentId }
      });
    };

    return {
      currentDocId,
      currentCategoryId,
      currentVersionId,
      currentDocument,
      versions,
      currentVersion,
      isLoading,
      navigateToDocument,
      changeVersion,
      navigateToEditor
    };
  }
});
</script>

<style lang="scss" scoped>
.documentation-page {
  display: flex;
  height: calc(100vh - var(--header-height));
  overflow: hidden;

  // Responsive styles
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
}
</style>
