# BellHopper

Use HTML attributes defer to server-side rendering for browser interactions

## BellHopModal
BellHopModal allows you to display a modal window populated with HTML rendered from a remote route.

```HTML
  <a remote-action="remote-modal" modal-url="/bags/new">New Bag</a>
```

### HTML Attributes

* **remote-action** - Tell BellHopper to trigger a remote modal on click.
* **modal-url** - The URL which renders the HTML to populate the modal with.

### Behavior
When clicked, BellHopper will show a new Bootstrap modal dialog. This dialog will then be populated with the HTML returned by a GET request to the URL specified by the `modal-url` attribute.

### Populating the modal
BellHopper expects the modal-url HTML to include a form. When this form is rendered, BellHopper will bind to the submission of this form and submit it using AJAX. The response from the server is expected to conform to the BellHopper server message spec.

##### Form response status routing
BellHopper expects the server to respond with JSON containing a status message. The content of this status message determines what happens next:

* **'Success'** - The modal interaction is complete. BellHopper will close the modal.
* **'UnprocessibleEntity'** - The form submitted data which wasn't processible. This is reponse is also expected to have a `template` attribute containing HTML, to replace the contents of the modal (for example, this could be the same form, but with an error message).

##### Closing the modal
If the form contains an element with an attribute with `data-action="cancel"`, BellHopper will close the modal when that element is clicked.

```HTML
  <a data-action="cancel">Close this window</a>
```

## BellHopAction
BellHopAction allows you to send remote AJAX requests when a DOM element is clicked:

```HTML
  <a remote-action="remote-action"
       remote-url="/bags/favourite" remote-method="POST">
    Mark favourite
  </a>
```

### HTML Attributes

* **remote-action="remote-action"** - Tell BellHopper to trigger a remote action on click.
* **remote-url** - The target URL to request to.
* **remote-method** - The HTML verb to use to request (PUT, POST etc..).

### Behavior
When clicked, remote actions make a request using the given HTTP verb to the specified URL. The response is expected to conform the the remote message spec specified in this document. `status` 'Success' is expected, anything else will throw an error and request the user reloads the page. If mutated models are listed the the response, they will be updated (again, see the remote message spec).

## Updatable views
Updateable views are DOM elements on a page whose content can be re-rendered by a call to a remote URL. Updatable views are marked with the models that the represent.

```HTML
  <ul data-remote-partial-url="/bags/list"
      data-model="bags">
    <li>A Lovely Veblen Bag</li>
  </ul>
```

### HTML Attributes

* **data-remote-partial-url** - The URL on the server which will return HTML to update the contents of this DOM element.
* **data-model** - The model which this partial represents. This can be any string.

### Updating a view
You can update all partials which represents a model using this command:

```Javascript
  UpdateableViews.updateViewsForModel('bags')
```

This will trigger a request to the `data-remote-partial-url` and replace the contents of the DOM element with the returned HTML.

This behavior is triggered automatically when a change event occurs on a model (e.g. from other remote actions). See the mutated models description for more details

## Server messaging spec
BellHopper remote actions and modals expect the server to respond with JSON in case of success or error. The response may contain the following keys

  * **status** (required) - JSON responses should always include a 'status' attribute, which contains a string describing the status of the request. For a response that succeeds, this should be 'Success'. See the documentation for each action to see what other statuses are accepted.
 * **mutated_models** (optional) - comma separated string which specifies which (if any) models were modified (add, delete, update) by the request. This then triggers `RemoteHelpers.triggerChange(<modelName>)`, which will fire a `'change:<modelName>'` event on document, and request that all UpdateableViews for that model are re-rendered from the server. This will happen once for each model specified in the mutated_models string. 
  * **template** (optional) - Some states will require a new HTML to be rendered to the DOM (for example, when a RemoteModalView needs to re-render a form with errors). `template` is where the new HTML to be rendered lives.


### Contributing

Fork the repository, then get the project set up with the following steps. 

Install the projects dependencies with:

```bash
  npm install
```

Compile the distribution version and watch for changes with:

```bash
  gulp
```

To run the tests:

```bash
  open tests.html
```

Once that is all set up, then add your new feature with tests and submit a Pull Request for review.

