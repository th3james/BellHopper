class window.RemoteResponseValidator
  constructor: (@remoteUrl) ->

  @validateSuccessfulResponse: (responseBody, remoteUrl) ->
    validator = new RemoteResponseValidator(remoteUrl)
    validator.validateResponseType(responseBody)
    validator.validateStatusPresent(responseBody)

  @validateErrorResponse: (response, status, message, remoteUrl) ->
    validator = new RemoteResponseValidator(remoteUrl)
    validator.validateNotServerError(response, status, message)
    validator.validateErrorResponseIsJSON(response)
    validator.validateStatusPresent(response.responseJSON)

  validateResponseType: (responseBody) ->
    unless typeof responseBody is 'object'
      errorMessage = "Post to #{@remoteUrl} expected to respond with JSON, but got"
      console.log "#{errorMessage}: "
      console.log responseBody

      RemoteHelpers.notifyUserOfError()
      throw new RemoteResponseError("#{errorMessage} '#{responseBody}'")

  validateNotServerError: (response, status, message) ->
    if (typeof message is 'string') and (message.match(/^Internal Server Error.*/))
      errorMessage = "Error '#{status} - #{message}' submitting remote form to #{@remoteUrl}"
      console.log "#{errorMessage}:"
      console.log response

      RemoteHelpers.notifyUserOfError()
      throw new RemoteResponseError(errorMessage)

  validateErrorResponseIsJSON: (response) ->
    unless response.responseJSON?
      errorMessage = "Request to #{@remoteUrl} expected to respond with JSON, but got '#{
        response.responseText}'"
      console.log errorMessage

      RemoteHelpers.notifyUserOfError()
      throw new RemoteResponseError(errorMessage)

  validateStatusPresent: (response) ->
    unless response.status?
      console.log "Server response lacked a status message:"
      console.log response

      RemoteHelpers.notifyUserOfError()
      throw new RemoteResponseError("Post to #{@remoteUrl} didn't respond with a status attribute (#{
        JSON.stringify(response)
      })")

class window.RemoteResponseError extends Error
