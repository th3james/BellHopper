modalTemplate = """
  <div class="modal">
    <div class="modal-dialog">
      <div class="modal-content">
      </div>
    </div>
  </div>
"""

window.BellHopper = {}

class BellHopper.ModalView
  constructor: (srcEl)->
    @config = RemoteHelpers.extractAttributes(srcEl)
    RemoteHelpers.requireAttributes(@config, ['modal-url'])

    @$el = $(modalTemplate)
    $('body').append(@$el)
    @$el.modal('show')

  submitForm: (form) ->
    remoteAction = form.attr('action')
    $.post(
       remoteAction, form.serialize()
    ).then((responseBody, status, response) =>
      RemoteResponseValidator.validateSuccessfulResponse(responseBody, remoteAction)

      @routeResponse(responseBody)
    ).fail((response, status, errorMsg)=>
      RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction)

      @routeResponse(response.responseJSON)
    )

  routeResponse: (response) =>
    switch response.status
      when 'Success'
        @close()
        RemoteHelpers.triggerChange(@config['mutates-models'])
      when 'UnprocessableEntity'
        @replaceModalContent(response.template)
      else
        throw new Error("Unknown response status #{response.status}")

  replaceModalContent: (html)->
    @setHtml(html)
    @bindToForm()
    $(document).trigger('partial:load', [@$el.find('.modal-content').children()])

  setHtml: (html) ->
    @$el.find('.modal-content').html(html)

  bindToForm: ->
    form = @$el.find('form')
    form.on('submit', (e) =>
      e.preventDefault()
      @submitForm(form)
    )

    cancelButton = @$el.find('[data-action="cancel"]')
    cancelButton.on('click', (e) =>
      e.preventDefault()
      @close()
    )
  
  render: ->
    deferred = $.Deferred()

    $.get(@config['modal-url']).done((body) =>
      @replaceModalContent(body)
      deferred.resolve()

    ).fail((response) =>
      console.log("Error fetching modal content:")
      console.log(response)
      @setHtml("Unable to load content, please reload the page")
      deferred.reject(
        new Error("Unable to load remote view from '#{@config['modal-url']}'")
      )
    )

    return deferred.promise()

  close: =>
    @$el.modal('hide')
    @$el.remove()

RemoteHelpers.onDataAction('remote_modal', 'click', (event) ->
  view = new RemoteModalView(event.currentTarget)
  view.render()
)
