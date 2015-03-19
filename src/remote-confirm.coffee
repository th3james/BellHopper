window.RemoteConfirm = (srcEl)->
  config = RemoteHelpers.extractAttributes(srcEl)

  RemoteHelpers.requireAttributes(config, ['remote-url'])

  if confirm "Are you sure?"
    $.ajax(
      url: config['remote-url']
      method: config['remote-method']
    ).done(->
      RemoteHelpers.triggerChange(config['mutates-models'])
    )

RemoteHelpers.onDataAction('remote_confirm', 'click', (event) ->
  RemoteConfirm(event.currentTarget)
)

