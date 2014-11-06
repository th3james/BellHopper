describe 'RemoteResponseValidator', ->
  describe '.validateErrorResponse', ->
    describe 'given an empty error response', ->
      response = {"readyState":0,"responseText":"","status":0,"statusText":"error"}
      status = 'error'
      errorMsg = undefined
      remoteAction = "/pigs/oink"

      it "throws an appropriate error", ->
        alertStub = sinon.stub(window, 'alert', ->)

        expect(->
          RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction)
        ).toThrow(new RemoteResponseError("Request to #{remoteAction} expected to respond with JSON, but got ''"))

        expect(alertStub.calledWith(
          "Sorry, something when wrong. Please try again, or reload the page"
        )).toBeTruthy()
        alertStub.restore()
