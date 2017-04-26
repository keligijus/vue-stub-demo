<template>
  <span v-if="usersTyping.length"
    class="is-typing-indicator">
    <span v-if="usersTyping.length === 1">{{ usersTyping[0].username }} is typing...</span>
    <span v-else-if="usersTyping.length === 2">{{ usersTyping[0].username }} and {{ usersTyping[1].username }} are typing...</span>
    <span v-else>{{ usersTyping.length }} are typing...</span>
  </span>
</template>
<script>
export default {
  /* globals _ */
  name: 'user-is-typing',
  props: ['postId'],
  data () {
    return {
      usersTyping: [],
      typingInterval: null
    }
  },
  created () {
    this.startTypingInterval()
  },
  destroyed () {
    // stop checking for typing timeouts
    clearInterval(this.typingInterval)
  },
  methods: {
    isAimedHere (socketData) {
      if (this.isMe(socketData)) return false
      return this.isAimedAtThisChannel(socketData) || this.isAimedAtThisPost(socketData)
    },
    isAimedAtThisChannel (socketData) {
      // 1:1 and group chats only
      if (this.$route.name === 'groups') return false
      if (!this.$route.params || !this.$route.params.channel) return false

      var channel = this.$route.params.channel
      var inGroup = channel.indexOf(',') > 1
      var aimedAtGroup = socketData.route.indexOf(',') > 1

      if (inGroup && aimedAtGroup && channel.indexOf(socketData.username) > -1) return true
      if (!inGroup && !aimedAtGroup && channel === socketData.username) return true
      return false
    },
    isAimedAtThisPost (socketData) {
      // public posts
      if (!this.postId || !socketData.postId) return false
      return this.postId === socketData.postId
    },
    isMe (socketData) {
      // check if it's me who's typing
      return socketData.username === this.$store.state.users.loggedInUser.username
    },
    removeFromTyping (username) {
      var index = _.findIndex(this.usersTyping, (o) => o.username === username)
      if (index > -1) this.usersTyping.splice(index, 1)
    },
    addToTyping (username) {
      var index = _.findIndex(this.usersTyping, (o) => o.username === username)

      if (index < 0) {
        // add user to userTyping
        this.usersTyping.push({
          username,
          lastTypingTime: (new Date()).getTime()
        })
      } else {
        // update type time
        this.usersTyping[index].lastTypingTime = (new Date()).getTime()
      }
    },
    startTypingInterval: function () {
      var typingDelay = 1000 * 3 // 3 sec
      var self = this

      // repeatedly check if users are still typing
      this.typingInterval = window.setInterval(() => {
        // stop if noone is typing
        if (!this.usersTyping.length) return

        var now = (new Date()).getTime()

        this.usersTyping.forEach((user) => {
          var timeDiff = now - user.lastTypingTime
          // remove if user idle
          if (timeDiff >= typingDelay) self.removeFromTyping(user.username)
        })
      }, 1000)
    }
  },
  sockets: {
    typing (data) {
      if (!this.isAimedHere(data)) return false
      this.addToTyping(data.username)
      if (!this.isTyping) this.isTyping = true
    },
    stopTyping (data) {
      if (!this.isAimedHere(data)) return false
      this.removeFromTyping(data.username)
      if (!this.usersTyping.length) this.isTyping = false
    }
  }
}
</script>
<style scoped>
span.is-typing-indicator {
  color: #999;
  font-size: 75%;
  width: calc(100% - 40px);
  max-height: 13px;
  position: absolute;
  top: -14px;
}
</style>
