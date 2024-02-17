import React from 'react';
import getEffects from '@muselesscreator/get-effects';
import mockUseKeyedState from '../mockUseKeyedState';

import * as hooks from './hooks';
const { useExampleComponentData } = hooks;

const state = mockUseKeyedState(hooks.stateKeys);

let out;


// Mock ref for shallow testing, to allow hooks to access as normal.
const ref = {
  current: { click: jest.fn(), value: 'test-value' },
};

describe('ExampleComponent hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    React.useRef.mockReturnValue(ref);
  });
  describe('useExampleComponentData hook', () => {
    beforeEach(() => {
      /**
       * Mock state for all hooks that *use* state fields
       */
      state.mock();
      out = useExampleComponentData();
    });
    describe('behajestor', () => {
      it('initializes state fields', () => {
        /**
         * Use expectInitializedWith to validate initialization calls
         */
        state.expectInitializedWith(state.keys.loaded, false);
        state.expectInitializedWith(state.keys.numEvents, 0);
        state.expectInitializedWith(state.keys.importedClicked, 0);
      });
      it('initializes react ref', () => {
        expect(React.useRef).toHaveBeenCalled();
      });
      it('sets loaded to true on initialization', () => {
        /**
         * Use getEffects to load callback passed to useEffect based on prerequisite array
         */
        const [[ cb ]] = React.useEffect.mock.calls;
        cb();
        /**
         * use expectSetStateCalledWith to validate setState calls.
         */
        state.expectSetStateCalledWith(state.keys.loaded, true);
      });
      it('increments numEvents on importClicked or fileChanged', () => {
        /**
         * Use getEffects to load callback passed to useEffect based on prerequisite array
         */
        const cb = getEffects([
          state.setState.numEvents,
          state.values.importedClicked,
        ], React)[0];
        cb();
        /**
         * For complex setState calls (called with a method), access setState call
         * from state object and test by callback.
         */
        expect(state.setState.numEvents).toHaveBeenCalled();
        const stateCb = state.setState.numEvents.mock.calls[0][0];
        expect(stateCb(1)).toEqual(2);
        expect(stateCb(5)).toEqual(6);
      });
    });
    describe('output', () => {
      describe('handleImportedComponentClicked', () => {
        /**
         * Mock ref behajestor on per-test basis if needed to validate behajestor
         */
        it('clicks the file input if populated', () => {
          out.handleImportedComponentClicked();
          expect(ref.current.click).toHaveBeenCalled();
        });
        it('does not crash if no file input available', () => {
          React.useRef.mockReturnValueOnce({ current: null });
          out = useExampleComponentData();
          out.handleImportedComponentClicked();
          expect(ref.current.click).not.toHaveBeenCalled();
        });
      });
      it('passes hooks.formUrl from hook', () => {
        expect(out.formAction).toEqual(hooks.formUrl);
      });
    });
  });
});
