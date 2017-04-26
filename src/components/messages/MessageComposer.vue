<template>
  <div  v-bind:class="{'is-editing': isEditing}">
    <form>
      <textarea class="composer"
        placeholder="Send message"/><!--
        --><span class="button outline" v-if="isEditing">Cancel</span><!--
        --><button type="submit" class="composer" v-if="!isEditing">Send</button><!--
        --><button type="submit" class="composer" v-if="isEditing">Save</button>
    </form>
    <span class="markdown-explanation ellipsis">Markdown supported: *italic* **bold** ##Headings
      [link](url) – <em>shift+enter for new line</em></span>
  </div>
</template>

<script>
import testMixin from '../../mixins/testMixin'

export default {
  name: '',
  props: ['isEditing', 'message'],
  mixins: [testMixin],
  created () {
    // edits are always populated with the original message
    if (!this.isEditing) this.getAutosavedDraft()
  },
  methods: {
    getAutosavedDraft () {
      console.log('vue getAutosavedDraft')
      var route = this.$route.params.channel
      var message = this.getDraft(route)
      this.$set(this, 'msg', message)
    }
  }
}
</script>