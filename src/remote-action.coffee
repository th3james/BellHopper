window.RemoteAction = (srcEl) ->
  config = RemoteHelpers.extractAttributes(srcEl)
  RemoteHelpers.requireAttributes(config, ['remote-url'])

  $.ajax(
    url: config['remote-url']
    method: config['remote-method']
  ).done((response)->
    
    RemoteHelpers.triggerChange(response['mutated_models'])
  ).fail((xhr, status, err, response)->
    console.error err
    throw new Error("Error making request #{config['remote-method']} #{config['remote-url']}")
  )

RemoteHelpers.onDataAction('remote_action', 'click', (event) ->
  RemoteAction(event.currentTarget)
)
