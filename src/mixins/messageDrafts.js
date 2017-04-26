/* globals localStorage */
export default {
  methods: {
    saveDraft (route, message) {
      var draftsString = localStorage.getItem('drafts') || '{}'
      var drafts = JSON.parse(draftsString)

      if (message) {
        // using route as a key
        drafts[route] = message
      } else {
        // deletes param if there's no message
        delete drafts[route]
      }

      localStorage.setItem('drafts', JSON.stringify(drafts))
    },
    getDraft (route) {
      // convert route to string (if number)
      if (typeof route === 'number') route = route.toString()

      var draftsString = localStorage.getItem('drafts') || '{}'
      // localStorage returns a string, convert to Object
      var drafts = JSON.parse(draftsString)
      // keys are routes
      var keys = Object.keys(drafts)
      // see if any routes and keys match
      var matched = keys.filter(key => key === route)[0]

      return drafts[matched]
    }
  }
}
