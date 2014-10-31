var modalTemplate,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

modalTemplate = "<div class=\"modal\">\n  <div class=\"modal-dialog\">\n    <div class=\"modal-content\">\n    </div>\n  </div>\n</div>";

window.RemoteModalView = (function() {
  function RemoteModalView(srcEl) {
    this.close = __bind(this.close, this);
    this.routeResponse = __bind(this.routeResponse, this);
    this.config = RemoteHelpers.extractAttributes(srcEl);
    RemoteHelpers.requireAttributes(this.config, ['modal-url']);
    this.$el = $(modalTemplate);
    $('body').append(this.$el);
    this.$el.modal('show');
  }

  RemoteModalView.prototype.submitForm = function(form) {
    var remoteAction;
    remoteAction = form.attr('action');
    return $.post(remoteAction, form.serialize()).then((function(_this) {
      return function(responseBody, status, response) {
        RemoteResponseValidator.validateSuccessfulResponse(responseBody, remoteAction);
        return _this.routeResponse(responseBody);
      };
    })(this)).fail((function(_this) {
      return function(response, status, errorMsg) {
        RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction);
        return _this.routeResponse(response.responseJSON);
      };
    })(this));
  };

  RemoteModalView.prototype.routeResponse = function(response) {
    switch (response.status) {
      case 'Success':
        this.close();
        return RemoteHelpers.triggerChange(this.config['mutates-models']);
      case 'UnprocessableEntity':
        return this.replaceModalContent(response.template);
      default:
        throw new Error("Unknown response status " + response.status);
    }
  };

  RemoteModalView.prototype.replaceModalContent = function(html) {
    this.setHtml(html);
    this.bindToForm();
    return $(document).trigger('partial:load', [this.$el.find('.modal-content').children()]);
  };

  RemoteModalView.prototype.setHtml = function(html) {
    return this.$el.find('.modal-content').html(html);
  };

  RemoteModalView.prototype.bindToForm = function() {
    var cancelButton, form;
    form = this.$el.find('form');
    form.on('submit', (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.submitForm(form);
      };
    })(this));
    cancelButton = this.$el.find('[data-action="cancel"]');
    return cancelButton.on('click', (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.close();
      };
    })(this));
  };

  RemoteModalView.prototype.render = function() {
    var deferred;
    deferred = $.Deferred();
    $.get(this.config['modal-url']).done((function(_this) {
      return function(body) {
        _this.replaceModalContent(body);
        return deferred.resolve();
      };
    })(this)).fail((function(_this) {
      return function(response) {
        console.log("Error fetching modal content:");
        console.log(response);
        _this.setHtml("Unable to load content, please reload the page");
        return deferred.reject(new Error("Unable to load remote view from '" + _this.config['modal-url'] + "'"));
      };
    })(this));
    return deferred.promise();
  };

  RemoteModalView.prototype.close = function() {
    this.$el.modal('hide');
    return this.$el.remove();
  };

  return RemoteModalView;

})();

RemoteHelpers.onDataAction('remote_modal', 'click', function(event) {
  var view;
  view = new RemoteModalView(event.currentTarget);
  return view.render();
});
