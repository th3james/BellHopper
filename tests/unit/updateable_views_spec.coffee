describe "UpdateableViews", ->
  describe ".updateViewsForModels", ->
    it "calls updateView on each DOM element which matches data-model for the
    given model", ->
      matchingView = $("""
        <div id="matching-el" data-model="investigation"></div>
      """)[0]
      $('body').append(matchingView)
      
      updateViewStub = sinon.stub(UpdateableViews, 'updateView', ->)

      UpdateableViews.updateViewsForModels('investigation')

      expect(updateViewStub.callCount).toEqual(1)
      updateViewEl = $(updateViewStub.getCall(0).args[0])
      expect(
        updateViewEl.attr('id')
      ).toEqual('matching-el')

      updateViewStub.restore()
      matchingView.remove()

  describe ".updateView", ->
    describe "when a data-remote-partial-url is specified", ->
      describe "and that remote URL exists", ->
        partialUrl = '/links'
        viewEl = $("""
          <div data-remote-partial-url="#{partialUrl}"></div>
        """)[0]

        it "queries the remote partial URL and replaces the view with the result", ->
          server = sinon.fakeServer.create()
          updatedText = "Reloaded from server"
          server.respondWith(partialUrl,
            [200, "", updatedText])

          UpdateableViews.updateView(viewEl)
          server.respond()

          expect(
            $(viewEl).text()
          ).toEqual(updatedText)

          server.restore()

        it "triggers partial:load on the document with the loaded content", ->
          server = sinon.fakeServer.create()
          returnedClass = ".returned-class"
          server.respondWith(partialUrl,
            [200, "", "<span class='#{returnedClass}'>Reloaded</span>"])

          partialLoadSpy = sinon.spy()
          $(document).on('partial:load', partialLoadSpy)

          UpdateableViews.updateView(viewEl)
          server.respond()

          expect(partialLoadSpy.callCount).toEqual(1)
          loadedPartial = partialLoadSpy.getCall(0).args[1]
          expect(loadedPartial.hasClass(returnedClass)).toBeTruthy()

          server.restore()
          $(document).off('partial:load', partialLoadSpy)

      describe "but the remote URL doesn't work", ->
        it "logs an error"

    describe "when data-remote-partial-url isn't specified", ->
      it "logs an error"
        
