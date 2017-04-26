/* global describe, it, expect, sinon, before, beforeEach, afterEach */
import avioraz, { mount } from 'avoriaz'
import Vuex from 'vuex'
import MessageComposer from '../MessageComposer.vue'
import VueRouter from 'vue-router'

avioraz.use(Vuex)
avioraz.use(VueRouter)

const sandbox = sinon.sandbox.create()

describe('MessageComposer.vue', () => {
  let store
  let actions
  let propsData

  before(() => {
    console.log(`PLEASE READ THIS:
Stub should be called almost on every test. Except only for one wehre propsData.isEditing is set to true. At the moment, it seems that it's only called on the first test (if make any other test to be first, the stub is going to be run on that test only.
It seems that is is, but neither callCount nor called are registered`)
  })

  beforeEach(() => {
    propsData = {
      isEditing: false,
      message: {
        id: 1
      }
    }
    actions = {
      add: sandbox.stub(),
      edit: sandbox.stub()
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        users: {
          namespaced: true,
          state: {
            loggedInUser: {
              username: 'Alan'
            }
          }
        },
        messages: {
          namespaced: true,
          state: {},
          actions: actions
        }
      }
    })

    sandbox.stub(MessageComposer.methods, 'getAutosavedDraft')
  })

  afterEach(() => {
    console.log('stub callCount', MessageComposer.methods.getAutosavedDraft.callCount)
    sandbox.restore()
  })

  describe('Random test of tests', () => {
    it('mounts composer to see if stub is fired', () => {
      const wrapper = mount(MessageComposer, { propsData, store })
      // console.log(wrapper.vm)
      // console.log(JSON.stringify(wrapper.vm.$options.methods))
      expect(wrapper.contains('button')).to.be.true
    })
  })

  describe('DOM Elements', () => {
    it('contains submit button', () => {
      const wrapper = mount(MessageComposer, { propsData, store })
      expect(wrapper.contains('button[type=submit]')).to.be.true
    })
  })
})
