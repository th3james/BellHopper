describe 'Remote Modal View', ->
  describe '.constructor', ->
    it "creates a DOM element with the .modal class", ->
      expect($('.modal').length).toBe(0)
      view = new RemoteModalView($('<div data-modal-url="/">')[0])
      expect($('.modal').length).toBe(1)
      view.close()

    it "throws an error if the source object lacks a data-modal-url", ->
      expect(->
        new RemoteModalView($('<div data-action="remote_modal">')[0])
      ).toThrow(new Error('data-action="remote_modal" elements must specify a data-modal-url attribute'))

  describe "#replaceModalContent", ->
    it "triggers partial:load on the document with the new HTML", ->
      view = new RemoteModalView($('<div data-modal-url="/">')[0])
      newPartial = '<span class="tastic">Hello World</span>'

      triggerCount = 0
      assertCallback = (event, partial) ->
        triggerCount += 1
        renderedPartial = view.$el.find('span.tastic')[0]
        expect($(renderedPartial).text()).toEqual('Hello World')

      $(document).on('partial:load', assertCallback)

      view.replaceModalContent(newPartial)

      $(document).off('partial:load', assertCallback)

      expect(triggerCount).toEqual(1)

  describe "#close", ->
    it "removes the modal HTML from the page", ->
      view = new RemoteModalView($('<div data-modal-url="/">')[0])
      modalCount = $('.modal').length

      view.close()

      expect($('.modal').length).toBe(modalCount - 1)

  describe "#submitForm", ->
    stubPostResponse = (status, responseArgs)->
      sinon.stub($, 'post', ->
        deferred = $.Deferred()
        if status is 'success'
          deferred.resolve(responseArgs[0], responseArgs[1], responseArgs[2])
        else
          deferred.reject(responseArgs[0], responseArgs[1], responseArgs[2])
        return deferred
      )
    remoteAction = "/study"
    fakeForm = $("<form action=" + remoteAction + ">")

    describe "when given 500 server error", ->
      response = {responseText: "<html></html>"}
      status = "error"
      message = "Internal Server Error "

      it "alerts the user to reload and throws an appropriate error", ->
        alertStub = sinon.stub(window, 'alert', ->)
        postStub = stubPostResponse('fail', [response, status, message])

        view = new RemoteModalView($('<div data-modal-url="/">')[0])

        expect(->
          view.submitForm(fakeForm)
        ).toThrow(new RemoteResponseError("Error 'error - Internal Server Error ' submitting remote form to #{remoteAction}"))

        expect(alertStub.calledWith(
          "Sorry, something when wrong. Please try again, or reload the page"
        )).toBeTruthy()
        alertStub.restore()
        postStub.restore()

    describe "when given a JSON response with no status", ->
      response = {}
      status = "success"
      message = {responseJSON: {}}

      it "alerts the user to reload and throws an appropriate error", ->
        alertStub = sinon.stub(window, 'alert', ->)
        postStub = stubPostResponse('success', [response, status, message])
        view = new RemoteModalView($('<div data-modal-url="/">')[0])

        expect(->
          view.submitForm(fakeForm)
        ).toThrow(
          new RemoteResponseError("Post to #{remoteAction} didn't respond with a status attribute (#{JSON.stringify(response)})")
        )

        expect(alertStub.calledWith(
          "Sorry, something when wrong. Please try again, or reload the page"
        )).toBeTruthy()
        
        alertStub.restore()
        postStub.restore()

    describe "when given a success response with HTML", ->
      response = "<span>wut?</span>"
      status = "success"
      message = {responseText: "<span>wut?</span>"}

      it "alerts the user to reload and throws an appropriate error", ->
        alertStub = sinon.stub(window, 'alert', ->)
        postStub = stubPostResponse('success', [response, status, message])
        view = new RemoteModalView($('<div data-modal-url="/">')[0])

        expect(->
          view.submitForm(fakeForm)
        ).toThrow(
          new RemoteResponseError("Post to #{remoteAction} expected to respond with JSON, but got '#{
            response
          }'")
        )

        expect(alertStub.calledWith(
          "Sorry, something when wrong. Please try again, or reload the page"
        )).toBeTruthy()

        alertStub.restore()
        postStub.restore()
