<template>
  <div class="documentation-editor">
    <div class="editor-header">
      <input v-model="title" placeholder="Document Title" />
      <div class="editor-actions">
        <button @click="preview = !preview">
          {{ preview ? 'Edit' : 'Preview' }}
        </button>
        <button @click="save">Save</button>
      </div>
    </div>

    <div class="editor-content">
      <textarea
        v-if="!preview"
        v-model="content"
        placeholder="Write your documentation in Markdown..."
      ></textarea>
      <MarkdownRenderer v-else :content="content" />
    </div>

    <div class="editor-settings">
      <DocumentVersionSelector v-model="version" />
      <DocumentAccessSelector v-model="accessLevel" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import DocumentVersionSelector from './DocumentationVersionSelector.vue';
// DocumentAccessSelector is not created yet, so it's commented out.
// import DocumentAccessSelector from './DocumentAccessSelector.vue';

export default {
  name: 'DocumentationEditor',
  components: {
    MarkdownRenderer,
    DocumentVersionSelector
    // DocumentAccessSelector,
  },
  props: {
    document: {
      type: Object,
      default: () => ({
        title: '',
        content: '',
        version: '',
        accessLevel: 'public'
      })
    }
  },
  setup(props, { emit }) {
    const title = ref(props.document.title);
    const content = ref(props.document.content);
    const version = ref(props.document.version);
    const accessLevel = ref(props.document.accessLevel);
    const preview = ref(false);

    const save = () => {
      emit('save', {
        title: title.value,
        content: content.value,
        version: version.value,
        accessLevel: accessLevel.value
      });
    };

    return {
      title,
      content,
      version,
      accessLevel,
      preview,
      save
    };
  }
};
</script>

<style lang="scss" scoped>
.documentation-editor {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.editor-content {
  margin-bottom: 1rem;
}
textarea {
  width: 100%;
  height: 400px;
}
</style>
