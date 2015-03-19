window.RemoteHelpers =
  extractAttributes: (el) ->
    el = el[0] unless el.attributes?
    attributes = {}

    dataAttrRegex = /^data\-/
    $.each(el.attributes, ->
      if @specified and @name.match(dataAttrRegex)
        key = @name.replace(dataAttrRegex, '')
        attributes[key] = @value
    )

    return attributes

  requireAttributes: (attributes, required) ->
    for requiredAttribute in required
      unless attributes[requiredAttribute]
          throw new Error(
            "data-action=\"#{attributes['action']}\" elements must specify a data-#{requiredAttribute} attribute"
          )

  onDataAction: (dataAction, eventName, handler) ->
    $(document).on("ready page:load", ->
      $('body').delegate("[data-action=\"#{dataAction}\"]", eventName, handler)
    )

  triggerChange: (models) ->
    for model in models.split(",")
      do (model) ->
        $(document).trigger("change:#{model.trim()}", [model])
        UpdateableViews.updateViewsForModels(model)

  notifyUserOfError: ->
    alert "Sorry, something when wrong. Please try again, or reload the page"
