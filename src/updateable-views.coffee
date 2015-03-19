window.UpdateableViews =
  updateViewsForModel: (model) ->
    $("[data-model=\"#{model}\"]").each((i, viewEl)->
      UpdateableViews.updateView(viewEl)
    )
  
  updateView: (el)->
    remoteUrl = $(el).attr('data-remote-partial-url')
    $.get(remoteUrl).done((renderedPartial) ->
      $(el).html(renderedPartial)
      $(document).trigger('partial:load', [$(el).children()])
    )

