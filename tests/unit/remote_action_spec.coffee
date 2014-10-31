describe 'Remote Action', ->

  describe 'when the given element has no remote-url specified', ->
    it 'throws an error', ->
      element = $('<div data-action="remote-action">')
      expect(->
        RemoteAction(element)
      ).toThrow(new Error('data-action="remote-action" elements must specify a data-remote-url attribute'))

  describe 'when the request responds with mutated models', ->
    remoteUrl = "/favourite"
    element = $("""
      <div data-remote-url="#{remoteUrl}" data-remote-method="PATCH">
    """)[0]
    mutatedModels = "favorited"
    responseJson = {"mutated_models": mutatedModels}

    it 'triggers an update for the mutated models', ->
      server = sinon.fakeServer.create()
      server.respondWith("PATCH", remoteUrl
        [201, { "Content-Type": "text/json" },
          JSON.stringify(responseJson)]
      )

      triggerChangeStub = sinon.stub(
        RemoteHelpers, 'triggerChange', ->)

      RemoteAction(element)
      server.respond()

      expect(
        triggerChangeStub.calledWith(mutatedModels)
      ).toBeTruthy()

      server.restore()
      triggerChangeStub.restore()
