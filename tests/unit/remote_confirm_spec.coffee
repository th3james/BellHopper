describe 'Remote Confirm', ->
  actualConfirm = window.confirm

  describe 'when the given element has no remote-url specified', ->
    it 'throws an error', ->
      element = $('<div data-action="remote-confirm">')
      expect(->
        RemoteConfirm(element)
      ).toThrow(new Error('data-action="remote-confirm" elements must specify a data-remote-url attribute'))

  describe 'when the dialog is confirmed', ->
    it 'makes the request to the URL', ->
      window.confirm = -> true
      remoteUrl = "/waffles"
      remoteMethod = "DELETE"
      element = $("""
        <div data-remote-url="#{remoteUrl}" data-remote-method="#{remoteMethod}">
      """)[0]

      server = sinon.fakeServer.create()

      RemoteConfirm(element)
      
      expect(server.requests.length).toEqual(1)
      request = server.requests[0]
      expect(request.url).toEqual(remoteUrl)
      expect(request.method).toEqual(remoteMethod)

      server.restore()
      window.confirm = actualConfirm

    it "calls UpdatableViews.updateViewsForModel() with the mutated model", ->
      window.confirm = -> true
      remoteUrl = "/waffles"
      remoteMethod = "DELETE"
      mutatedModels = "investigations"
      element = $("""
        <div data-remote-url="#{remoteUrl}"
            data-remote-method="#{remoteMethod}"
            data-mutates-models="#{mutatedModels}">
      """)[0]

      server = sinon.fakeServer.create()
      server.respondWith(remoteUrl,
        [201, { "Content-Type": "text/html" }, "OK"])

      updateViewsStub = sinon.stub(
        UpdateableViews, 'updateViewsForModel', ->)

      RemoteConfirm(element)
      server.respond()

      expect(
        updateViewsStub.calledWith(mutatedModels)
      ).toBeTruthy()

      server.restore()
      updateViewsStub.restore()
      window.confirm = actualConfirm

  describe 'when the dialog is rejected', ->
    it 'does not make a request', ->
      window.confirm = -> false
      server = sinon.fakeServer.create()

      RemoteConfirm($("<div data-remote-url='/'>"))
      expect(server.requests.length).toEqual(0)

      server.restore()
      window.confirm = actualConfirm
