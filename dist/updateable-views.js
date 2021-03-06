(function() {
  window.UpdateableViews = {
    updateViewsForModel: function(model) {
      return $("[data-model=\"" + model + "\"]").each(function(i, viewEl) {
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
