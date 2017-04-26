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
      expect(wrapper.contains('button')).to.be.true
    })
  })

  describe('DOM Elements', () => {
    it('contains submit button', () => {
      const wrapper = mount(MessageComposer, { propsData, store })
      expect(wrapper.contains('button[type=submit]')).to.be.true
    })
  })

  describe('Hooks', () => {
    describe('data()', () => {
      it('sets correct default data', () => {
        const wrapper = mount(MessageComposer, { propsData, store })
        expect(wrapper.data().msg).to.equal('')
        expect(wrapper.data().composerHeight.verticalPadding).to.equal(20)
        expect(wrapper.data().composerHeight.lineHeight).to.equal(13)
        expect(wrapper.data().composerHeight.total).to.equal(33)
      })
    })
    describe('created()', () => {
      it('does nothing if isEditing', () => {
        propsData.isEditing = true
        mount(MessageComposer, { propsData, store })
        expect(MessageComposer.methods.getAutosavedDraft.called).to.be.false
        // Note: checking for undefined to make sure that the stub is working as it should
        expect(MessageComposer.methods.getAutosavedDraft.called).not.to.be.undefined
      })
      it('gets autosaved draft (when not in editing mode)', () => {
        mount(MessageComposer, { propsData, store })
        expect(MessageComposer.methods.getAutosavedDraft.called).to.be.true
      })
    })
    describe('watch{}', () => {
      describe('$route()', () => {
        it('fetches saved draft on route change', (done) => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          // reset call count, because it was called during initial render (on $mount)
          MessageComposer.methods.getAutosavedDraft.reset()
          router.push({name: 'messages', params: {channel: 'banana'}})
          wrapper.vm.$nextTick(() => {
            expect(MessageComposer.methods.getAutosavedDraft.called).to.be.true
            done()
          })
        })
        it('focuses on composer', (done) => {
          const router = new VueRouter({routes: [
            {path: '/messages', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router, attachToDocument: true })
          const spy = sinon.spy(wrapper.vm, 'focusOnComposer')
          router.push({name: 'messages'})
          wrapper.vm.$nextTick(() => {
            expect(spy.called).to.be.true
            spy.restore()
            done()
          })
        })
      })
    })
    describe('computed{}', () => {
      describe('composerId()', () => {
        it('returns correct id depending if component is in editing mode', () => {
          propsData.isEditing = true
          const wrapper = mount(MessageComposer, { propsData, store })
          const el = wrapper.find('#id-1')
          expect(el.length).to.equal(1)
          expect(wrapper.vm.composerId).to.equal('id-1')
        })
        it('returns correct id depending if component is not in editing mode', () => {
          const wrapper = mount(MessageComposer, { propsData, store })
          const el = wrapper.find('#id-1')
          expect(el.length).to.not.equal(1)
          expect(wrapper.vm.composerId).to.equal('message-composer')
        })
      })
    })
    describe('mounted()', () => {
      it('prefills input with message body when editing', () => {
        propsData.message.message = 'Hello Alan Watts!'
        const wrapper = mount(MessageComposer, { propsData, store })
        expect(wrapper.data().msg).to.equal('Hello Alan Watts!')
      })
      it('doesn\'t prefill input if message prop is not passed', () => {
        delete propsData.message
        const wrapper = mount(MessageComposer, { propsData, store })
        expect(wrapper.data().msg).to.equal('')
      })
      it('focuses on composer *issue on Github*', () => {
        // NOTE: Github issue opened regarding stubbing/spying methods of premounted component
        const spy = sinon.spy(MessageComposer.methods, 'focusOnComposer')
        mount(MessageComposer, { propsData, store, attachToDocument: true })
        expect(spy.called).to.be.true
        spy.restore()
      })
    })
    describe('methods{}', () => {
      describe('keyupHandler()', () => {
        it('fires userTyping()', () => {
          const router = new VueRouter({routes: [
            {path: '/messages', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stub = sinon.stub(wrapper.vm, 'userTyping')
          const event = {target: {value: 'HEY!'}}

          wrapper.vm.keyupHandler(event)

          expect(stub.called).to.be.true
          stub.restore()
        })
        it('fires autosaveDraft() if is not in editing mode', () => {
          const router = new VueRouter({routes: [
            {path: '/messages', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const event = {target: {value: 'HEY!'}}
          const spy = sinon.spy(wrapper.vm, 'autosaveDraft')
          const stub = sinon.stub(wrapper.vm, 'userTyping')

          wrapper.vm.keyupHandler(event)

          expect(spy.called).to.be.true
          stub.restore()
          spy.restore()
        })
      })
      describe('submitHandler()', () => {
        it('fires correct methods', () => {
          const wrapper = mount(MessageComposer, { propsData, store })
          const editMessageStub = sinon.stub(wrapper.vm, 'editMessage')
          const postMessageStub = sinon.stub(wrapper.vm, 'postMessage')

          wrapper.vm.submitHandler()

          expect(editMessageStub.called).to.be.false
          expect(postMessageStub.called).to.be.true
        })
      })
      describe('postMessage()', () => {
        it('dispatches "messages/add" action', () => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const resizeComposerStub = sinon.stub(wrapper.vm, 'resizeComposer')
          const emitStopTypingSocketEventStub = sinon.stub(wrapper.vm, 'emitStopTypingSocketEvent')
          const autosaveDraftStub = sinon.stub(wrapper.vm, 'autosaveDraft')

          wrapper.vm.postMessage()

          expect(actions.add.called).to.be.true

          resizeComposerStub.restore()
          emitStopTypingSocketEventStub.restore()
          autosaveDraftStub.restore()
        })
        it('fires correct methods', () => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const resizeComposerStub = sinon.stub(wrapper.vm, 'resizeComposer')
          const emitStopTypingSocketEventStub = sinon.stub(wrapper.vm, 'emitStopTypingSocketEvent')
          const autosaveDraftStub = sinon.stub(wrapper.vm, 'autosaveDraft')

          wrapper.vm.postMessage()

          expect(resizeComposerStub.called).to.be.true
          expect(emitStopTypingSocketEventStub.called).to.be.true
          expect(autosaveDraftStub.called).to.be.true

          resizeComposerStub.restore()
          emitStopTypingSocketEventStub.restore()
          autosaveDraftStub.restore()
        })
      })
      describe('editMessage()', () => {
        it('dispatches "messages/edit" action', () => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stopEditStub = sinon.stub(wrapper.vm, 'stopEdit')

          wrapper.vm.editMessage()

          expect(actions.edit.called).to.be.true

          stopEditStub.restore()
        })
        it('fires correct methods', () => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stopEditStub = sinon.stub(wrapper.vm, 'stopEdit')

          wrapper.vm.editMessage()

          expect(stopEditStub.called).to.be.true

          stopEditStub.restore()
        })
      })
      describe('enterPressed()', () => {
        it('resizes composer and adds new line to msg if shift key is also pressed', () => {
          const wrapper = mount(MessageComposer, { propsData, store })
          const stub = sinon.stub(wrapper.vm, 'resizeComposer')
          const event = {
            shiftKey: true,
            preventDefault: () => true
          }

          wrapper.vm.enterPressed(event)

          expect(stub.called).to.be.true
          expect(wrapper.data().msg).to.equal('\n')

          stub.restore()
        })
        it('fires submitHandler() if shift key wasn\'t pressed', () => {
          const wrapper = mount(MessageComposer, { propsData, store })
          const stub1 = sinon.stub(wrapper.vm, 'resizeComposer')
          const stub2 = sinon.stub(wrapper.vm, 'submitHandler')
          const event = {
            shiftKey: false,
            preventDefault: () => true
          }

          wrapper.vm.enterPressed(event)

          expect(stub1.called).to.be.false
          expect(stub2.called).to.be.true

          stub1.restore()
          stub2.restore()
        })
      })
      describe('userTyping()', () => {
        it('emits stopTypingEvent when if "Enter" without "Shift" are pressed (form submitted)', () => {
          const event = { key: 'Enter', shiftKey: false }
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stub = sinon.stub(wrapper.vm, 'emitStopTypingSocketEvent')

          wrapper.vm.userTyping(event)

          expect(stub.called).to.be.true
          stub.restore()
        })
        it('emits stopTypingEvent when input is empty', () => {
          const event = { key: 'Some other key', target: { value: '' } }
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stub = sinon.stub(wrapper.vm, 'emitStopTypingSocketEvent')
          const stub2 = sinon.stub(wrapper.vm, 'emitTypingSocketEvent')

          wrapper.vm.userTyping(event)

          expect(stub.called).to.be.true
          expect(stub2.called).to.be.false
          stub.restore()
          stub2.restore()
        })
        it('emits typingEvent othervise', () => {
          const event = { key: 'Some other key', target: { value: 'yay!' } }
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stub = sinon.stub(wrapper.vm, 'emitStopTypingSocketEvent')
          const stub2 = sinon.stub(wrapper.vm, 'emitTypingSocketEvent')

          wrapper.vm.userTyping(event)

          expect(stub.called).to.be.false
          expect(stub2.called).to.be.true
          stub.restore()
          stub2.restore()
        })
      })
      describe('resizeComposer()', (done) => {
        it('sets correct height if entered string is multiline', () => {
          const wrapper = mount(MessageComposer, { propsData })
          // message is multiline
          wrapper.setData({msg: '\n\nhello!'})
          wrapper.vm.resizeComposer()

          expect(wrapper.data().composerHeight.total).to.equal(59)
        })
        it('sets correct height if entered string is single line', () => {
          const wrapper = mount(MessageComposer, { propsData })
          wrapper.setData({msg: 'just one line'})
          wrapper.vm.resizeComposer()
          expect(wrapper.data().composerHeight.total).to.equal(33)
        })
      })
      describe('autosaveDraft', () => {
        it('saves draft (calls fn with correct args)', (done) => {
          const router = new VueRouter({routes: [
            {path: '/messages/:channel', name: 'messages', component: MessageComposer}
          ]})
          const wrapper = mount(MessageComposer, { propsData, store, router })
          const stub = sinon.stub(wrapper.vm, 'saveDraft')

          router.push({name: 'messages', params: {channel: 'banana'}})
          wrapper.vm.$nextTick(() => {
            wrapper.vm.autosaveDraft('Some message')
            expect(stub.args[0]).to.deep.equal(['banana', 'Some message'])
            stub.restore()
            done()
          })
        })
      })
      // describe.skip('getAutosavedDraft', () => {
      //   it('gets draft and updates msg', (done) => {
      //     const router = new VueRouter({routes: [
      //       {path: '/messages/:channel', name: 'messages', component: MessageComposer}
      //     ]})
      //     const wrapper = mount(MessageComposer, { propsData, store, router })
      //     const stub = sinon.stub(wrapper.vm, 'getDraft').returns('some returned message')

      //     router.push({name: 'messages', params: {channel: 'banana'}})

      //     wrapper.vm.$nextTick(() => {
      //       wrapper.vm.getAutosavedDraft()
      //       expect(wrapper.data().msg).to.equal('some returned message1')
      //       stub.restore()
      //       done()
      //     })
      //   })
      // })
    })
  })
})
