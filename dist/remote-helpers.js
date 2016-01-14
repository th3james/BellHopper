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
        return $('body').delegate("[data-action=\"" + dataAction + "\"]", eventName, handler);
      });
    },
    triggerChange: function(models) {
      var model, _i, _len, _ref, _results;
      _ref = models.split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        _results.push((function(model) {
          model = model.trim();
          $(document).trigger("change:" + model, [model]);
          return UpdateableViews.updateViewsForModel(model);
        })(model));
      }
      return _results;
    },
    notifyUserOfError: function() {
      return alert("Sorry, something when wrong. Please try again, or reload the page");
    }
  };

}).call(this);
