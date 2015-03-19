describe 'Remote Helpers', ->
  describe '.triggerChange', ->

    afterEach(()->
      $(document).off("change:study_designs")
    )
    
    it "triggers change:<model_name> on document for the given model name", ->
      eventSpy = sinon.spy()
      $(document).on('change:study_designs', eventSpy)

      RemoteHelpers.triggerChange('study_designs')

      expect(eventSpy.callCount).toEqual(1)

    describe 'with a comma seperated string of model names', ->

      afterEach(()->
        $(document).off("change:studies")
      )

      it "triggers change:<model_name> for each of the models in the list", ->
        eventSpy = sinon.spy()
        $(document).on('change:study_designs', eventSpy)
        $(document).on('change:studies', eventSpy)

        RemoteHelpers.triggerChange('study_designs, studies')

        expect(eventSpy.callCount).toEqual(2)

        
