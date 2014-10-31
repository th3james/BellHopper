describe 'Remote Modal View - Feature', ->
  describe "#render", ->
    it "requests the HTML for the modal from 'data-modal-url' and renders it
    to the modal body", (done) ->
      modalUrl = "/links/new"
      srcEl = $("<div data-modal-url='#{modalUrl}'>")[0]

      formText = "My Lovely Form"
      server = sinon.fakeServer.create()
      server.respondWith(modalUrl,
        [200, { "Content-Type": "text/html" }, "<div>#{formText}</div>"]
      )

      view = new RemoteModalView(srcEl)
      view.render().done(->
        modalText = $.trim(view.$el.text())
        expect(modalText).toEqual(formText)

      ).fail(->
        expected(false).toBeTruthy()

      ).always(->
        done()
        server.restore()
        view.close()
      )

      server.respond()

    it "renders an error message to the modal if the modal view request
    fails", (done) ->
      modalUrl = "/links/new"
      srcEl = $("<div data-modal-url='#{modalUrl}'>")

      server = sinon.fakeServer.create()
      server.respondWith(modalUrl,
        [500, { "Content-Type": "text/html" }, "ERROROROR"]
      )

      view = new RemoteModalView(srcEl)
      view.render().done(->
        expect(false).toBeTruthy()

      ).fail((err)->
        expect(err.message).toEqual(
          "Unable to load remote view from '#{modalUrl}'"
        )

        modalText = $.trim(view.$el.text())
        expect(modalText).toEqual(
          "Unable to load content, please reload the page"
        )

      ).always(->
        view.close()
        server.restore()
        done()
      )

      server.respond()

  describe "on a view with a remote form", ->
    modalUrl = "/links/new"
    srcEl = $("<div data-modal-url='#{modalUrl}'>")[0]

    formPostUrl = "/links"
    form = """
      <form action="#{formPostUrl}">
        <input type="submit">
        <button data-action="cancel">Cancel</button>
      </form>
    """
    formResponse = [200, { "Content-Type": "text/html" }, form]

    describe "when clicking submit", ->
      describe "if the request succeeds", ->
        successJSON = { status: "Success" }
        successResponse = [201, { "Content-Type": "text/json" }, JSON.stringify(
          successJSON
        )]

        it "closes the view", (done) ->
          server = sinon.fakeServer.create()
          # Fake routes
          server.respondWith(modalUrl, formResponse)
          server.respondWith(formPostUrl, successResponse)

          view = new RemoteModalView(srcEl)
          closeSpy = sinon.spy(view, 'close')

          view.render().done(->
            view.$el.find('input[type="submit"]').click()

            expect(server.requests.length).toEqual(2)
            expect(server.requests[1].url).toEqual(formPostUrl)
            server.respond()

            expect(closeSpy.callCount).toEqual(1)

          ).fail(->
            expect(false).toBeTruthy()
          ).always(->
            done()
            server.restore()
          )

          server.respond()

      describe "if the request returns an error form", ->
        newForm = "newForm"
        errorJson = {
          status: "UnprocessableEntity"
          template: newForm
        }
        errorResponse = [422, { "Content-Type": "text/json" }, JSON.stringify(
          errorJson
        )]

        it "renders the error form", (done) ->
          server = sinon.fakeServer.create()
          # Fake routes
          server.respondWith(modalUrl, formResponse)
          server.respondWith(formPostUrl, errorResponse)

          view = new RemoteModalView(srcEl)
          view.render().done(->
            view.$el.find('input[type="submit"]').click()

            expect(server.requests.length).toEqual(2)
            expect(server.requests[1].url).toEqual(formPostUrl)
            server.respond()

            expect(view.$el.html()).toMatch(///.*#{newForm}.*///)

          ).fail(->
            expect(false).toBeTruthy()
          ).always(->
            done()
            server.restore()
            view.close()
          )

          server.respond()

    it "closes the modal when cancel is clicked", ->
      view = new RemoteModalView(srcEl)
      view.replaceModalContent(form)

      modalCount = $('.modal').length
      view.$el.find('[data-action="cancel"]').click()

      expect($('.modal').length).toEqual(modalCount - 1)

  describe "for a view which mutates models, when the form is submitted", ->
    modalUrl = "/links/new"
    mutatedModels = "investigations"
    srcEl = $("""
      <div data-modal-url="#{modalUrl}" data-mutates-models="#{mutatedModels}">
    """)[0]

    formPostUrl = "/links"
    form = """
      <form action="#{formPostUrl}"><input type="submit"/></form>
    """

    it "calls RemoteHelper.triggerChange() with the mutated model", ->
      view = new RemoteModalView(srcEl)
      view.replaceModalContent(form)
      viewCloseSpy = sinon.spy(view, 'close')

      server = sinon.fakeServer.create()
      # Fake routes
      server.respondWith(formPostUrl,
        [201, { "Content-Type": "text/json" }, JSON.stringify(
          {status: "Success"}
        )])

      triggerChangeStub = sinon.stub(
        RemoteHelpers, 'triggerChange', ->)

      view.$el.find('input[type="submit"]').click()
      server.respond()
        
      try
        expect(
          triggerChangeStub.calledWith(mutatedModels)
        ).toBeTruthy()
        expect(
          viewCloseSpy.callCount
        ).toEqual(1)

      finally
        triggerChangeStub.restore()
        server.restore()

