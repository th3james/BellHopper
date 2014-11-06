# BellHopper

Use HTML attributes defer to server-side rendering for browser interactions

## BellHopModal
BellHopModal allows you to display a modal window populated with HTML rendered from a remote route.

```HTML
  <a remote-action="remote-modal" modal-url="/bags/new">New Bag</a>
```

### HTML Attributes

* **remote-action** - Tell BellHopper to trigger a remote modal on click.
* **modal-url** - The url which renders the HTML to populate the modal with.

### Behavior
When clicked, BellHopper will show a new Bootstrap modal dialog. This dialog will then be populated with the HTML returned by a GET request to the URL specified by the `modal-url` attribute.

### Populating the modal
BellHopper expects the modal-url HTML to include a form. When this form is rendered, BellHopper will bind to the submission of this form and submit it using AJAX. The response from the server is expected to conform to the BellHopper server message spec.

##### Form response status routing
BellHopper expects the server to respond with JSON containing a status message. The content of this status message determines what happens next:

* **'Success'** - The modal interaction is complete. BellHopper will close the modal.
* **'UnprocessibleEntity'** - The form submitted data which wasn't processible. This is reponse is also expected to have a 'template' variable containing HTML, to replace the contents of the modal (for example, this could be the same form, but with an error message).

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
When clicked, remote actions make a request using the given HTTP verb to the specified URL.

## Updatable views
TODO

## Server messaging spec
BellHopper remote actions and modals expect the server to respond with JSON in case of success or error. Your JSON responses should always include a 'status' attribute, which contains a string describing the status. For a response that suceeds, this should generally be 'Success'. See the documentation for each action to see what other status are accepted.

### Mutated modals
TODO

