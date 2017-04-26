/* globals _ */
export default {
  methods: {
    emitTypingSocketEvent: _.throttle(function (data) {
      return this.$socket.emit('typing', data)
    }, 2000),
    emitStopTypingSocketEvent: function (data) {
      return this.$socket.emit('stopTyping', data)
    }
  }
}
