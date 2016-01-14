(function() {
  window.RemoteConfirm = function(srcEl) {
    var config;
    config = RemoteHelpers.extractAttributes(srcEl);
    RemoteHelpers.requireAttributes(config, ['remote-url']);
    if (confirm("Are you sure?")) {
      return $.ajax({
        url: config['remote-url'],
        method: config['remote-method']
      }).done(function() {
        return RemoteHelpers.triggerChange(config['mutates-models']);
      });
    }
  };

  RemoteHelpers.onDataAction('remote_confirm', 'click', function(event) {
    event.preventDefault();
    return RemoteConfirm(event.currentTarget);
  });

}).call(this);
