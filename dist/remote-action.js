(function() {
  window.RemoteAction = function(srcEl) {
    var config;
    config = RemoteHelpers.extractAttributes(srcEl);
    RemoteHelpers.requireAttributes(config, ['remote-url']);
    return $.ajax({
      url: config['remote-url'],
      method: config['remote-method']
    }).done(function(response) {
      return RemoteHelpers.triggerChange(response['mutated_models']);
    }).fail(function(xhr, status, err, response) {
      console.error(err);
      throw new Error("Error making request " + config['remote-method'] + " " + config['remote-url']);
    });
  };

  RemoteHelpers.onDataAction('remote_action', 'click', function(event) {
    return RemoteAction(event.currentTarget);
  });

}).call(this);
