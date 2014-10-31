describe 'Remote Helpers', ->
  describe '.triggerChange', ->
    it "triggers change:<model_name> on document for the given model name", ->
      eventSpy = sinon.spy()
      $(document).on('change:study_designs', eventSpy)

      RemoteHelpers.triggerChange('study_designs')

      expect(eventSpy.callCount).toEqual(1)
