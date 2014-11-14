describe 'Remote Action', ->

  describe 'when the given element has no remote-url specified', ->
    it 'throws an error', ->
      element = $('<div data-action="remote-action">')
      expect(->
        BellHopper.RemoteAction(element)
      ).toThrow(new Error('data-action="remote-action" elements must specify a data-remote-url attribute'))

  describe 'on an element with with a remote url', ->
    remoteUrl = "/favourite"
    element = $("""
      <div data-remote-url="#{remoteUrl}" data-remote-method="PATCH">
    """)[0]

    describe 'when the request responds with mutated models', ->
      mutatedModels = "favorited"
      responseJson = {status: 'Sucess', mutated_models: mutatedModels}

      it 'triggers an update for the mutated models', ->
        server = sinon.fakeServer.create()
        server.respondWith("PATCH", remoteUrl
          [201, { "Content-Type": "text/json" },
            JSON.stringify(responseJson)]
        )

        triggerChangeStub = sinon.stub(
          RemoteHelpers, 'triggerChange', ->)

        BellHopper.RemoteAction(element)
        server.respond()

        expect(
          triggerChangeStub.calledWith(mutatedModels)
        ).toBeTruthy()

        server.restore()
        triggerChangeStub.restore()

    describe 'when the request with a json error state', ->
      responseJson = {status: 'UnprocessibleEntity'}

      it 'throws an error and alerts the user to reload the page', ->
        alertStub = sinon.stub(window, 'alert', ->)

        server = sinon.fakeServer.create()
        server.respondWith("PATCH", remoteUrl
          [422, { "Content-Type": "text/json" },
            JSON.stringify(responseJson)]
        )

        BellHopper.RemoteAction(element)
        server.respond()

        expect(alertStub.calledWith(
          "Sorry, something when wrong. Please try again, or reload the page"
        )).toBeTruthy()

        server.restore()
        alertStub.restore()
