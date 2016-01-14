window.RemoteAction = (srcEl) ->
  config = RemoteHelpers.extractAttributes(srcEl)
  RemoteHelpers.requireAttributes(config, ['remote-url'])

  remoteAction = config['remote-url']
  $.ajax(
    url: remoteAction
    method: config['remote-method']
  ).then((responseBody, status, response) ->
    RemoteResponseValidator.validateSuccessfulResponse(responseBody, remoteAction)
    
    RemoteHelpers.triggerChange(responseBody['mutated_models'])
  ).fail((response, status, errorMsg)->
    RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction)

    RemoteHelpers.notifyUserOfError()
    throw new Error("Expected status: 'Success', but #{config['remote-method']} #{remoteAction} responded with #{errorMsg}: #{JSON.stringify(response.responseJSON)}")
  )

RemoteHelpers.onDataAction('remote_action', 'click', (event) ->
  event.preventDefault()
  RemoteAction(event.currentTarget)
)
