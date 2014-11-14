describe('BellHopper Modal View - Feature', function() {
  describe("#render", function() {
    it("requests the HTML for the modal from 'data-modal-url' and renders it to the modal body", function(done) {
      var formText, modalUrl, server, srcEl, view;
      modalUrl = "/links/new";
      srcEl = $("<div data-modal-url='" + modalUrl + "'>")[0];
      formText = "My Lovely Form";
      server = sinon.fakeServer.create();
      server.respondWith(modalUrl, [
        200, {
          "Content-Type": "text/html"
        }, "<div>" + formText + "</div>"
      ]);
      view = new BellHopper.ModalView(srcEl);
      view.render().done(function() {
        var modalText;
        modalText = $.trim(view.$el.text());
        return expect(modalText).toEqual(formText);
      }).fail(function() {
        return expected(false).toBeTruthy();
      }).always(function() {
        done();
        server.restore();
        return view.close();
      });
      return server.respond();
    });
    return it("renders an error message to the modal if the modal view request fails", function(done) {
      var modalUrl, server, srcEl, view;
      modalUrl = "/links/new";
      srcEl = $("<div data-modal-url='" + modalUrl + "'>");
      server = sinon.fakeServer.create();
      server.respondWith(modalUrl, [
        500, {
          "Content-Type": "text/html"
        }, "ERROROROR"
      ]);
      view = new BellHopper.ModalView(srcEl);
      view.render().done(function() {
        return expect(false).toBeTruthy();
      }).fail(function(err) {
        var modalText;
        expect(err.message).toEqual("Unable to load remote view from '" + modalUrl + "'");
        modalText = $.trim(view.$el.text());
        return expect(modalText).toEqual("Unable to load content, please reload the page");
      }).always(function() {
        view.close();
        server.restore();
        return done();
      });
      return server.respond();
    });
  });
  describe("on a view with a remote form", function() {
    var form, formPostUrl, formResponse, modalUrl, srcEl;
    modalUrl = "/links/new";
    srcEl = $("<div data-modal-url='" + modalUrl + "'>")[0];
    formPostUrl = "/links";
    form = "<form action=\"" + formPostUrl + "\">\n  <input type=\"submit\">\n  <button data-action=\"cancel\">Cancel</button>\n</form>";
    formResponse = [
      200, {
        "Content-Type": "text/html"
      }, form
    ];
    describe("when clicking submit", function() {
      describe("if the request succeeds", function() {
        var successJSON, successResponse;
        successJSON = {
          status: "Success"
        };
        successResponse = [
          201, {
            "Content-Type": "text/json"
          }, JSON.stringify(successJSON)
        ];
        return it("closes the view", function(done) {
          var closeSpy, server, view;
          server = sinon.fakeServer.create();
          server.respondWith(modalUrl, formResponse);
          server.respondWith(formPostUrl, successResponse);
          view = new BellHopper.ModalView(srcEl);
          closeSpy = sinon.spy(view, 'close');
          view.render().done(function() {
            view.$el.find('input[type="submit"]').click();
            expect(server.requests.length).toEqual(2);
            expect(server.requests[1].url).toEqual(formPostUrl);
            server.respond();
            return expect(closeSpy.callCount).toEqual(1);
          }).fail(function() {
            return expect(false).toBeTruthy();
          }).always(function() {
            done();
            return server.restore();
          });
          return server.respond();
        });
      });
      return describe("if the request returns an error form", function() {
        var errorJson, errorResponse, newForm;
        newForm = "newForm";
        errorJson = {
          status: "UnprocessableEntity",
          template: newForm
        };
        errorResponse = [
          422, {
            "Content-Type": "text/json"
          }, JSON.stringify(errorJson)
        ];
        return it("renders the error form", function(done) {
          var server, view;
          server = sinon.fakeServer.create();
          server.respondWith(modalUrl, formResponse);
          server.respondWith(formPostUrl, errorResponse);
          view = new BellHopper.ModalView(srcEl);
          view.render().done(function() {
            view.$el.find('input[type="submit"]').click();
            expect(server.requests.length).toEqual(2);
            expect(server.requests[1].url).toEqual(formPostUrl);
            server.respond();
            return expect(view.$el.html()).toMatch(RegExp(".*" + newForm + ".*"));
          }).fail(function() {
            return expect(false).toBeTruthy();
          }).always(function() {
            done();
            server.restore();
            return view.close();
          });
          return server.respond();
        });
      });
    });
    return it("closes the modal when cancel is clicked", function() {
      var modalCount, view;
      view = new BellHopper.ModalView(srcEl);
      view.replaceModalContent(form);
      modalCount = $('.modal').length;
      view.$el.find('[data-action="cancel"]').click();
      return expect($('.modal').length).toEqual(modalCount - 1);
    });
  });
  return describe("for a view which mutates models, when the form is submitted", function() {
    var form, formPostUrl, modalUrl, mutatedModels, srcEl;
    modalUrl = "/links/new";
    mutatedModels = "investigations";
    srcEl = $("<div data-modal-url=\"" + modalUrl + "\" data-mutates-models=\"" + mutatedModels + "\">")[0];
    formPostUrl = "/links";
    form = "<form action=\"" + formPostUrl + "\"><input type=\"submit\"/></form>";
    return it("calls RemoteHelper.triggerChange() with the mutated model", function() {
      var server, triggerChangeStub, view, viewCloseSpy;
      view = new BellHopper.ModalView(srcEl);
      view.replaceModalContent(form);
      viewCloseSpy = sinon.spy(view, 'close');
      server = sinon.fakeServer.create();
      server.respondWith(formPostUrl, [
        201, {
          "Content-Type": "text/json"
        }, JSON.stringify({
          status: "Success"
        })
      ]);
      triggerChangeStub = sinon.stub(RemoteHelpers, 'triggerChange', function() {});
      view.$el.find('input[type="submit"]').click();
      server.respond();
      try {
        expect(triggerChangeStub.calledWith(mutatedModels)).toBeTruthy();
        return expect(viewCloseSpy.callCount).toEqual(1);
      } finally {
        triggerChangeStub.restore();
        server.restore();
      }
    });
  });
});

describe('BellHopper Modal View', function() {
  describe('.constructor', function() {
    it("creates a DOM element with the .modal class", function() {
      var view;
      $('.modal').remove();
      expect($('.modal').length).toBe(0);
      view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
      expect($('.modal').length).toBe(1);
      return view.close();
    });
    return it("throws an error if the source object lacks a data-modal-url", function() {
      return expect(function() {
        return new BellHopper.ModalView($('<div data-action="remote_modal">')[0]);
      }).toThrow(new Error('data-action="remote_modal" elements must specify a data-modal-url attribute'));
    });
  });
  describe("#replaceModalContent", function() {
    return it("triggers partial:load on the document with the new HTML", function() {
      var assertCallback, newPartial, triggerCount, view;
      view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
      newPartial = '<span class="tastic">Hello World</span>';
      triggerCount = 0;
      assertCallback = function(event, partial) {
        var renderedPartial;
        triggerCount += 1;
        renderedPartial = view.$el.find('span.tastic')[0];
        return expect($(renderedPartial).text()).toEqual('Hello World');
      };
      $(document).on('partial:load', assertCallback);
      view.replaceModalContent(newPartial);
      $(document).off('partial:load', assertCallback);
      return expect(triggerCount).toEqual(1);
    });
  });
  describe("#close", function() {
    return it("removes the modal HTML from the page", function() {
      var modalCount, view;
      view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
      modalCount = $('.modal').length;
      view.close();
      return expect($('.modal').length).toBe(modalCount - 1);
    });
  });
  return describe("#submitForm", function() {
    var fakeForm, remoteAction, stubPostResponse;
    stubPostResponse = function(status, responseArgs) {
      return sinon.stub($, 'post', function() {
        var deferred;
        deferred = $.Deferred();
        if (status === 'success') {
          deferred.resolve(responseArgs[0], responseArgs[1], responseArgs[2]);
        } else {
          deferred.reject(responseArgs[0], responseArgs[1], responseArgs[2]);
        }
        return deferred;
      });
    };
    remoteAction = "/study";
    fakeForm = $("<form action=" + remoteAction + ">");
    describe("when given 500 server error", function() {
      var message, response, status;
      response = {
        responseText: "<html></html>"
      };
      status = "error";
      message = "Internal Server Error ";
      return it("alerts the user to reload and throws an appropriate error", function() {
        var alertStub, postStub, view;
        alertStub = sinon.stub(window, 'alert', function() {});
        postStub = stubPostResponse('fail', [response, status, message]);
        view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
        expect(function() {
          return view.submitForm(fakeForm);
        }).toThrow(new RemoteResponseError("Error 'error - Internal Server Error ' submitting remote form to " + remoteAction));
        expect(alertStub.calledWith("Sorry, something when wrong. Please try again, or reload the page")).toBeTruthy();
        alertStub.restore();
        return postStub.restore();
      });
    });
    describe("when given a JSON response with no status", function() {
      var message, response, status;
      response = {};
      status = "success";
      message = {
        responseJSON: {}
      };
      return it("alerts the user to reload and throws an appropriate error", function() {
        var alertStub, postStub, view;
        alertStub = sinon.stub(window, 'alert', function() {});
        postStub = stubPostResponse('success', [response, status, message]);
        view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
        expect(function() {
          return view.submitForm(fakeForm);
        }).toThrow(new RemoteResponseError("Post to " + remoteAction + " didn't respond with a status attribute (" + (JSON.stringify(response)) + ")"));
        expect(alertStub.calledWith("Sorry, something when wrong. Please try again, or reload the page")).toBeTruthy();
        alertStub.restore();
        return postStub.restore();
      });
    });
    return describe("when given a success response with HTML", function() {
      var message, response, status;
      response = "<span>wut?</span>";
      status = "success";
      message = {
        responseText: "<span>wut?</span>"
      };
      return it("alerts the user to reload and throws an appropriate error", function() {
        var alertStub, postStub, view;
        alertStub = sinon.stub(window, 'alert', function() {});
        postStub = stubPostResponse('success', [response, status, message]);
        view = new BellHopper.ModalView($('<div data-modal-url="/">')[0]);
        expect(function() {
          return view.submitForm(fakeForm);
        }).toThrow(new RemoteResponseError("Post to " + remoteAction + " expected to respond with JSON, but got '" + response + "'"));
        expect(alertStub.calledWith("Sorry, something when wrong. Please try again, or reload the page")).toBeTruthy();
        alertStub.restore();
        return postStub.restore();
      });
    });
  });
});

describe('Remote Action', function() {
  describe('when the given element has no remote-url specified', function() {
    return it('throws an error', function() {
      var element;
      element = $('<div data-action="remote-action">');
      return expect(function() {
        return RemoteAction(element);
      }).toThrow(new Error('data-action="remote-action" elements must specify a data-remote-url attribute'));
    });
  });
  return describe('on an element with with a remote url', function() {
    var element, remoteUrl;
    remoteUrl = "/favourite";
    element = $("<div data-remote-url=\"" + remoteUrl + "\" data-remote-method=\"PATCH\">")[0];
    describe('when the request responds with mutated models', function() {
      var mutatedModels, responseJson;
      mutatedModels = "favorited";
      responseJson = {
        status: 'Sucess',
        mutated_models: mutatedModels
      };
      return it('triggers an update for the mutated models', function() {
        var server, triggerChangeStub;
        server = sinon.fakeServer.create();
        server.respondWith("PATCH", remoteUrl, [
          201, {
            "Content-Type": "text/json"
          }, JSON.stringify(responseJson)
        ]);
        triggerChangeStub = sinon.stub(RemoteHelpers, 'triggerChange', function() {});
        RemoteAction(element);
        server.respond();
        expect(triggerChangeStub.calledWith(mutatedModels)).toBeTruthy();
        server.restore();
        return triggerChangeStub.restore();
      });
    });
    return describe('when the request with a json error state', function() {
      var responseJson;
      responseJson = {
        status: 'UnprocessibleEntity'
      };
      return it('throws an error and alerts the user to reload the page', function() {
        var alertStub, server;
        alertStub = sinon.stub(window, 'alert', function() {});
        server = sinon.fakeServer.create();
        server.respondWith("PATCH", remoteUrl, [
          422, {
            "Content-Type": "text/json"
          }, JSON.stringify(responseJson)
        ]);
        RemoteAction(element);
        server.respond();
        expect(alertStub.calledWith("Sorry, something when wrong. Please try again, or reload the page")).toBeTruthy();
        server.restore();
        return alertStub.restore();
      });
    });
  });
});

describe('Remote Confirm', function() {
  var actualConfirm;
  actualConfirm = window.confirm;
  describe('when the given element has no remote-url specified', function() {
    return it('throws an error', function() {
      var element;
      element = $('<div data-action="remote-confirm">');
      return expect(function() {
        return RemoteConfirm(element);
      }).toThrow(new Error('data-action="remote-confirm" elements must specify a data-remote-url attribute'));
    });
  });
  describe('when the dialog is confirmed', function() {
    it('makes the request to the URL', function() {
      var element, remoteMethod, remoteUrl, request, server;
      window.confirm = function() {
        return true;
      };
      remoteUrl = "/waffles";
      remoteMethod = "DELETE";
      element = $("<div data-remote-url=\"" + remoteUrl + "\" data-remote-method=\"" + remoteMethod + "\">")[0];
      server = sinon.fakeServer.create();
      RemoteConfirm(element);
      expect(server.requests.length).toEqual(1);
      request = server.requests[0];
      expect(request.url).toEqual(remoteUrl);
      expect(request.method).toEqual(remoteMethod);
      server.restore();
      return window.confirm = actualConfirm;
    });
    return it("calls UpdatableViews.updateViewsForModels() with the mutated model", function() {
      var element, mutatedModels, remoteMethod, remoteUrl, server, updateViewsStub;
      window.confirm = function() {
        return true;
      };
      remoteUrl = "/waffles";
      remoteMethod = "DELETE";
      mutatedModels = "investigations";
      element = $("<div data-remote-url=\"" + remoteUrl + "\"\n    data-remote-method=\"" + remoteMethod + "\"\n    data-mutates-models=\"" + mutatedModels + "\">")[0];
      server = sinon.fakeServer.create();
      server.respondWith(remoteUrl, [
        201, {
          "Content-Type": "text/html"
        }, "OK"
      ]);
      updateViewsStub = sinon.stub(UpdateableViews, 'updateViewsForModels', function() {});
      RemoteConfirm(element);
      server.respond();
      expect(updateViewsStub.calledWith(mutatedModels)).toBeTruthy();
      server.restore();
      updateViewsStub.restore();
      return window.confirm = actualConfirm;
    });
  });
  return describe('when the dialog is rejected', function() {
    return it('does not make a request', function() {
      var server;
      window.confirm = function() {
        return false;
      };
      server = sinon.fakeServer.create();
      RemoteConfirm($("<div data-remote-url='/'>"));
      expect(server.requests.length).toEqual(0);
      server.restore();
      return window.confirm = actualConfirm;
    });
  });
});

describe('Remote Helpers', function() {
  return describe('.triggerChange', function() {
    return it("triggers change:<model_name> on document for the given model name", function() {
      var eventSpy;
      eventSpy = sinon.spy();
      $(document).on('change:study_designs', eventSpy);
      RemoteHelpers.triggerChange('study_designs');
      return expect(eventSpy.callCount).toEqual(1);
    });
  });
});

describe('RemoteResponseValidator', function() {
  return describe('.validateErrorResponse', function() {
    return describe('given an empty error response', function() {
      var errorMsg, remoteAction, response, status;
      response = {
        "readyState": 0,
        "responseText": "",
        "status": 0,
        "statusText": "error"
      };
      status = 'error';
      errorMsg = void 0;
      remoteAction = "/pigs/oink";
      return it("throws an appropriate error", function() {
        var alertStub;
        alertStub = sinon.stub(window, 'alert', function() {});
        expect(function() {
          return RemoteResponseValidator.validateErrorResponse(response, status, errorMsg, remoteAction);
        }).toThrow(new RemoteResponseError("Request to " + remoteAction + " expected to respond with JSON, but got ''"));
        expect(alertStub.calledWith("Sorry, something when wrong. Please try again, or reload the page")).toBeTruthy();
        return alertStub.restore();
      });
    });
  });
});

describe("UpdateableViews", function() {
  describe(".updateViewsForModels", function() {
    return it("calls updateView on each DOM element which matches data-model for the given model", function() {
      var matchingView, updateViewEl, updateViewStub;
      matchingView = $("<div id=\"matching-el\" data-model=\"investigation\"></div>")[0];
      $('body').append(matchingView);
      updateViewStub = sinon.stub(UpdateableViews, 'updateView', function() {});
      UpdateableViews.updateViewsForModels('investigation');
      expect(updateViewStub.callCount).toEqual(1);
      updateViewEl = $(updateViewStub.getCall(0).args[0]);
      expect(updateViewEl.attr('id')).toEqual('matching-el');
      updateViewStub.restore();
      return matchingView.remove();
    });
  });
  return describe(".updateView", function() {
    describe("when a data-remote-partial-url is specified", function() {
      describe("and that remote URL exists", function() {
        var partialUrl, viewEl;
        partialUrl = '/links';
        viewEl = $("<div data-remote-partial-url=\"" + partialUrl + "\"></div>")[0];
        it("queries the remote partial URL and replaces the view with the result", function() {
          var server, updatedText;
          server = sinon.fakeServer.create();
          updatedText = "Reloaded from server";
          server.respondWith(partialUrl, [200, "", updatedText]);
          UpdateableViews.updateView(viewEl);
          server.respond();
          expect($(viewEl).text()).toEqual(updatedText);
          return server.restore();
        });
        return it("triggers partial:load on the document with the loaded content", function() {
          var loadedPartial, partialLoadSpy, returnedClass, server;
          server = sinon.fakeServer.create();
          returnedClass = ".returned-class";
          server.respondWith(partialUrl, [200, "", "<span class='" + returnedClass + "'>Reloaded</span>"]);
          partialLoadSpy = sinon.spy();
          $(document).on('partial:load', partialLoadSpy);
          UpdateableViews.updateView(viewEl);
          server.respond();
          expect(partialLoadSpy.callCount).toEqual(1);
          loadedPartial = partialLoadSpy.getCall(0).args[1];
          expect(loadedPartial.hasClass(returnedClass)).toBeTruthy();
          server.restore();
          return $(document).off('partial:load', partialLoadSpy);
        });
      });
      return describe("but the remote URL doesn't work", function() {
        return it("logs an error");
      });
    });
    return describe("when data-remote-partial-url isn't specified", function() {
      return it("logs an error");
    });
  });
});
