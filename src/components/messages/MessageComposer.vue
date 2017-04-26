<template>
  <div  v-bind:class="{'is-editing': isEditing}">
    <form @submit.prevent="submitHandler">
      <user-is-typing></user-is-typing>
      <textarea class="composer"
        :id="composerId"
        @keydown.enter.prevent="enterPressed"
        @keydown.esc="stopEdit"
        @keyup="keyupHandler"
        @keyup.delete="resizeComposer"
        :style="{height: composerHeight.total + 'px'}"
        v-model="msg" autocomplete="off"
        placeholder="Send message"/><!--
        --><span class="button outline" v-if="isEditing" @click="stopEdit">Cancel</span><!--
        --><button type="submit" class="composer" v-if="!isEditing">Send</button><!--
        --><button type="submit" class="composer" v-if="isEditing">Save</button>
    </form>
    <span class="markdown-explanation ellipsis">Markdown supported: *italic* **bold** ##Headings
      [link](url) – <em>shift+enter for new line</em></span>
  </div>
</template>

<script>
import UserIsTyping from '../UserIsTyping'
import emitSocketEvents from '../../mixins/emitSocketEvents'
import messageDrafts from '../../mixins/messageDrafts'
import utils from '../../mixins/utils'

export default {
  name: '',
  components: {
    'user-is-typing': UserIsTyping
  },
  props: ['isEditing', 'message'],
  mixins: [utils, emitSocketEvents, messageDrafts],
  data () {
    const verticalPadding = 2 * 10
    const lineHeight = 13
    return {
      msg: '',
      composerHeight: {
        lineHeight: lineHeight,
        verticalPadding: verticalPadding,
        total: lineHeight + verticalPadding
      }
    }
  },
  created () {
    // edits are always populated with the original message
    if (!this.isEditing) this.getAutosavedDraft()
  },
  watch: {
    $route () {
      this.focusOnComposer()
      this.getAutosavedDraft()
    }
  },
  computed: {
    composerId () {
      return this.isEditing ? `id-${this.message.id}` : 'message-composer'
    }
  },
  mounted () {
    // prefill with message body when editing
    if (this.message && this.message.message) this.msg = this.message.message
    this.focusOnComposer()
  },
  methods: {
    keyupHandler (event) {
      this.userTyping(event)
      // do not save edits as they are always overwritten by orignal msg
      if (!this.isEditing) this.autosaveDraft(event.target.value)
    },
    submitHandler () {
      this.isEditing
        ? this.editMessage()
        : this.postMessage()
    },
    postMessage: function () {
      var data = {
        message: this.msg,
        author: this.$store.state.users.loggedInUser.username,
        channel: this.getParticipantsFromMessageRoute(this.$route.params.channel)
      }

      this.$store.dispatch('messages/add', data)

      this.msg = '' // clear message in form input elements
      this.resizeComposer()
      this.emitStopTypingSocketEvent({route: this.$route.params.channel})
      this.autosaveDraft() // clear localStorage draft
    },
    editMessage () {
      var data = {
        id: this.message.id,
        message: this.msg,
        channel: this.getParticipantsFromMessageRoute(this.$route.params.channel), // for optimistic UI update
        prevMessage: this.message.message // passed to revert to if update fails
      }

      this.$store.dispatch('messages/edit', data)
      this.stopEdit()
    },
    enterPressed: function (event) {
      if (event.shiftKey) {
        // submit if shift+enter was pressed
        event.preventDefault()
        this.msg += '\n'
        this.resizeComposer()
      } else {
        this.submitHandler()
      }
    },
    userTyping (e) {
      if (e.key === 'Enter' && !e.shiftKey) return this.emitStopTypingSocketEvent({route: this.$route.params.channel})
      if (!e.target.value.length) return this.emitStopTypingSocketEvent({route: this.$route.params.channel})

      return this.emitTypingSocketEvent({route: this.$route.params.channel})
    },
    resizeComposer: function () {
      const numlinebreaks = (this.msg.match(/\n/g) || []).length
      const height = ((numlinebreaks + 1) * this.composerHeight.lineHeight) + this.composerHeight.verticalPadding
      this.composerHeight.total = height
    },
    autosaveDraft (message) {
      var route = this.$route.params.channel
      this.saveDraft(route, message)
    },
    getAutosavedDraft () {
      var route = this.$route.params.channel
      var message = this.getDraft(route)
      this.$set(this, 'msg', message)
    },
    stopEdit () {
      if (this.isEditing) this.$emit('stopEdit')
    },
    focusOnComposer () {
      const composerElement = document.getElementById(this.composerId)
      if (composerElement !== null) composerElement.focus()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
form {
  position: relative;
  background: #eee;
  padding: 1px;
  /*bottom: 20px;*/
  display: block;
  width: 100%;
}

.is-editing form {
  position: relative;
  bottom: 0;
  margin-top: 10px;
  width: 100%;
}

.is-editing span.markdown-explanation {
  position: relative;
  bottom: 0;
}

form textarea {
  border: 0;
  padding: 10px; /* if you change this, remember to adjust data().composerHeight values */
  width: 80%;
  resize: none;
  height: 33px;
  vertical-align: bottom;
  overflow-y: hidden;
}

button,
.button {
  width: 20%;
}

.is-editing textarea {
  width: 70%;
}

.is-editing button,
.is-editing .button {
  width: 15%;
}

span.button {
  display: inline-block;
  text-align: center;
}

span.markdown-explanation {
  position: absolute;
  bottom: 5px;
  color: #999;
  font-size: 75%;
  width: calc(100% - 40px);
}

.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
