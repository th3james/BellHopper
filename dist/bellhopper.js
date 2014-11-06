(function() {
  window.RemoteHelpers = {
    extractAttributes: function(el) {
      var attributes, dataAttrRegex;
      if (el.attributes == null) {
        el = el[0];
      }
      attributes = {};
      dataAttrRegex = /^data\-/;
      $.each(el.attributes, function() {
        var key;
        if (this.specified && this.name.match(dataAttrRegex)) {
          key = this.name.replace(dataAttrRegex, '');
          return attributes[key] = this.value;
        }
      });
      return attributes;
    },
    requireAttributes: function(attributes, required) {
      var requiredAttribute, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = required.length; _i < _len; _i++) {
        requiredAttribute = required[_i];
        if (!attributes[requiredAttribute]) {
          throw new Error("data-action=\"" + attributes['action'] + "\" elements must specify a data-" + requiredAttribute + " attribute");
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    onDataAction: function(dataAction, eventName, handler) {
      return $(document).on("ready page:load", function() {
        return $('#main').delegate("[data-action=\"" + dataAction + "\"]", eventName, handler);
      });
    },
    triggerChange: function(models) {
      $(document).trigger("change:" + models, [models]);
      return UpdateableViews.updateViewsForModels(models);
    },
    notifyUserOfError: function() {
      return alert("Sorry, something when wrong. Please try again, or reload the page");
    }
  };

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.RemoteResponseValidator = (function() {
    function RemoteResponseValidator(remoteUrl) {
      this.remoteUrl = remoteUrl;
    }

    RemoteResponseValidator.validateSuccessfulResponse = function(responseBody, remoteUrl) {
      var validator;
      validator = new RemoteResponseValidator(remoteUrl);
      validator.validateResponseType(responseBody);
      return validator.validateStatusPresent(responseBody);
    };

    RemoteResponseValidator.validateErrorResponse = function(response, status, message, remoteUrl) {
      var validator;
      validator = new RemoteResponseValidator(remoteUrl);
      validator.validateNotServerError(response, status, message);
      validator.validateErrorResponseIsJSON(response);
      return validator.validateStatusPresent(response.responseJSON);
    };

    RemoteResponseValidator.prototype.validateResponseType = function(responseBody) {
      var errorMessage;
      if (typeof responseBody !== 'object') {
        errorMessage = "Post to " + this.remoteUrl + " expected to respond with JSON, but got";
        console.log("" + errorMessage + ": ");
        console.log(responseBody);
        RemoteHelpers.notifyUserOfError();
        throw new RemoteResponseError("" + errorMessage + " '" + responseBody + "'");
      }
    };

    RemoteResponseValidator.prototype.validateNotServerError = function(response, status, message) {
      var errorMessage;
      if ((typeof message === 'string') && (message.match(/^Internal Server Error.*/))) {
        errorMessage = "Error '" + status + " - " + message + "' submitting remote form to " + this.remoteUrl;
        console.log("" + errorMessage + ":");
        console.log(response);
        RemoteHelpers.notifyUserOfError();
        throw new RemoteResponseError(errorMessage);
      }
    };

    RemoteResponseValidator.prototype.validateErrorResponseIsJSON = function(response) {
      var errorMessage;
      if (response.responseJSON == null) {
        errorMessage = "Request to " + this.remoteUrl + " expected to respond with JSON, but got '" + response.responseText + "'";
        console.log(errorMessage);
        RemoteHelpers.notifyUserOfError();
        throw new RemoteResponseError(errorMessage);
      }
    };

    RemoteResponseValidator.prototype.validateStatusPresent = function(response) {
      if (response.status == null) {
        console.log("Server response lacked a status message:");
        console.log(response);
        RemoteHelpers.notifyUserOfError();
        throw new RemoteResponseError("Post to " + this.remoteUrl + " didn't respond with a status attribute (" + (JSON.stringify(response)) + ")");
      }
    };

    return RemoteResponseValidator;

  })();

  window.RemoteResponseError = (function(_super) {
    __extends(RemoteResponseError, _super);

    function RemoteResponseError() {
      return RemoteResponseError.__super__.constructor.apply(this, arguments);
    }

    return RemoteResponseError;

  })(Error);

}).call(this);

(function() {
  window.UpdateableViews = {
    updateViewsForModels: function(models) {
      return $("[data-model=\"" + models + "\"]").each(function(i, viewEl) {
        return UpdateableViews.updateView(viewEl);
      });
    },
    updateView: function(el) {
      var remoteUrl;
      remoteUrl = $(el).attr('data-remote-partial-url');
      return $.get(remoteUrl).done(function(renderedPartial) {
        $(el).html(renderedPartial);
        return $(document).trigger('partial:load', [$(el).children()]);
      });
    }
  };

}).call(this);

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
        return UpdateableViews.updateViewsForModels(config['mutates-models']);
      });
    }
  };

  RemoteHelpers.onDataAction('remote_confirm', 'click', function(event) {
    return RemoteConfirm(event.currentTarget);
  });

}).call(this);

(function() {
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

}).call(this);
