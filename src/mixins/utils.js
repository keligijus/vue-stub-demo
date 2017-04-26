/* globals moment, Autolinker, emojione, showdown, $ */
export default {
  computed: {
    users () {
      return this.$store.state.users.users
    },
    loggedInUser () {
      return this.$store.state.users.loggedInUser
    }
  },
  methods: {
    formatMessageDate: function (date) {
      if (moment(date).startOf('day').isSame(moment().startOf('day'))) {
        return moment(date).format('hh:mm A')
      }
      return moment(date).format('MMM DD hh:mm A')
    },
    formatPostDate: function (date) {
      if (moment(date).startOf('day').isSame(moment().startOf('day'))) {
        return moment(date).format('hh:mm A')
      }
      return moment(date).format('MMM DD')
    },
    formatUserCreated: function (date) {
      return moment(date, 'ddd MMM DD YYYY hh:mm:ss [GMT]ZZ').format('MMMM Do YYYY')
    },
    formatLastSeen: function (date) {
      if (date == null) return 'never'
      return moment(date, 'ddd MMM DD YYYY hh:mm:ss [GMT]ZZ').fromNow()
    },
    linkMessageText: function (message) {
      if (typeof (message) !== 'undefined' && message) {
        var converter = new showdown.Converter({literalMidWordUnderscores: true, simpleLineBreaks: true})
        return Autolinker.link(
          emojione.toImage(
            converter.makeHtml(
              message)),
          { truncate: { length: 32, location: 'smart' } })
      }
    },
    getParticipantsFromMessageRoute: function (route) {
      // if route is undefined, channel should be empty
      if (typeof (route) === 'undefined') return ''

      // create an array from the route
      // channels with multiple participants are separated by commas
      var participantsArray = route.split(',')

      // add logged in user's name to array
      participantsArray.push(this.loggedInUser.username)

      // Sort the array by usernames
      participantsArray.sort()

      return participantsArray.toString()
    },
    getMessageRouteFromParticipants: function (participants) {
      // create an array from the participants list
      // channels with multiple participants are separated by commas
      var routeArray = participants.split(',')

      // remove logged in user's name from array
      var index = routeArray.indexOf(this.loggedInUser.username)
      routeArray.splice(index, 1)

      return routeArray.toString()
    },
    countParticipants: function (participants) {
      return participants.split(',').length
    },
    addSpacesToParticipantsList: function (participants) {
      if (typeof (participants) !== 'undefined') return participants.replace(/,/g, ', ')
    },
    getMessageGravatar: function (message) {
      try {
        return this.users.find(user => user.username === message.author).gravatar
      } catch (error) { }
    },
    profileLinkClick: function (username) {
      this.$store.commit('users/setProfileClicked', username)
      $('#user-profile').popup('show')
    },
    routeContainsPosts () {
      if (this.$route.name === 'latest') return true
      if (this.$route.name === 'groups') return true
      if (this.$route.meta && this.$route.meta.postsFilter) return true // top, saved & my posts - all have postsFilter
      return false
    },
    refreshQueriesOnReconnect () {
      console.log('refreshing queries on reconnect')
      const vm = this
      const queries = [
        { query: 'users/loadLoggedInUser' },
        { query: 'users/loadUserSettings' },
        { query: 'users/loadUsers' },
        { query: 'messages/getConversations' },
        { query: 'groups/retrieve' }
      ]

      // load messages
      if (this.$route.name === 'messages') {
        queries.push({
          query: 'messages/load',
          vars: { channel: this.$route.params.channel }
        })
      }

      // load posts (or single post)
      if (this.routeContainsPosts()) {
        this.$route.name === 'singlePost'
          ? queries.push({
            query: 'posts/loadOne',
            vars: { id: this.$route.params.postId }
          })
          : queries.push({
            query: 'posts/load',
            vars: { group: this.$route.params.channel }
          })
      }

      queries.forEach(q => vm.$store.dispatch(q.query, q.vars))
    }
  }
}
