(function() {
  window.RemoteAction = function(srcEl) {
    var config, remoteAction;
    config = RemoteHelpers.extractAttributes(srcEl);
    RemoteHelpers.requireAttributes(config, ['remote-url']);
    remoteAction = config['remote-url'];
    return $.ajax({
      url: remoteAction,
      method: config['remote-method']
    }).then(function(responseBody, status, response) {
      RemoteResponseValidator.validateSuccessfulResponse(responseBody, remoteAction);
      return RemoteHelpers.triggerChange(responseBody['mutated_models']);
    }).fail(function(response, status, errorMsg) {
      RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction);
      RemoteHelpers.notifyUserOfError();
      throw new Error("Expected status: 'Success', but " + config['remote-method'] + " " + remoteAction + " responded with " + errorMsg + ": " + (JSON.stringify(response.responseJSON)));
    });
  };

  RemoteHelpers.onDataAction('remote_action', 'click', function(event) {
    event.preventDefault();
    return RemoteAction(event.currentTarget);
  });

}).call(this);
