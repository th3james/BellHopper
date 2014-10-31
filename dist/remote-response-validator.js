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
