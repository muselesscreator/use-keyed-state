import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';
import React from 'react';
import getEffects from '@muselesscreator/get-effects';
import mockUseKeyedState from '../mockUseKeyedState';
import * as hookModule from '..';

import * as hooks from './hooks';
const { useExampleComponentData } = hooks;

vi.mock('react-intl', () => {
  const i18n = vi.importActual('@edx/frontend-platform/i18n');
  const { formatMessage } = vi.importActual('testUtils');
  return {
    ...i18n,
    useIntl: vi.fn(() => ({ formatMessage })),
    defineMessages: m => m,
  };
});

vi.mock('react', () => ({
  default: {
    ...vi.importActual('react'),
    useEffect: vi.fn((cb, prereqs) => ({ useEffect: { cb, prereqs } })),
    useRef: vi.fn((val) => ({ current: val, useRef: true })),
  },
}));


let out;


// Mock ref for shallow testing, to allow hooks to access as normal.
const ref = {
  current: { click: vi.fn(), value: 'test-value' },
};

let state;
let moduleState;
describe('ExampleComponent hooks', () => {
  beforeEach(() => {
    state = mockUseKeyedState(hooks.stateKeys);
    moduleState = mockUseKeyedState(hooks.stateKeys, hookModule);
    vi.clearAllMocks();
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
    describe('behavior', () => {
      it('initializes state fields', () => {
        /**
         * Use expectInitializedWith to validate initialization calls
         */
        state.expectInitializedWith(state.keys.loaded, false);
        state.expectInitializedWith(state.keys.numEvents, 0);
        state.expectInitializedWith(state.keys.importedClicked, 0);
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
         * Mock ref behavior on per-test basis if needed to validate behavior
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
  describe('useExampleComponentData hook with passed hook module', () => {
    beforeEach(() => {
      /**
       * Mock state for all hooks that *use* state fields
       */
      moduleState.mock();
      out = useExampleComponentData();
    });
    describe('behavior', () => {
      it('initializes state fields', () => {
        /**
         * Use expectInitializedWith to validate initialization calls
         */
        moduleState.expectInitializedWith(moduleState.keys.loaded, false);
        moduleState.expectInitializedWith(moduleState.keys.numEvents, 0);
        moduleState.expectInitializedWith(moduleState.keys.importedClicked, 0);
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
        moduleState.expectSetStateCalledWith(moduleState.keys.loaded, true);
      });
      it('increments numEvents on importClicked or fileChanged', () => {
        /**
         * Use getEffects to load callback passed to useEffect based on prerequisite array
         */
        const cb = getEffects([
          moduleState.setState.numEvents,
          moduleState.values.importedClicked,
        ], React)[0];
        cb();
        /**
         * For complex setState calls (called with a method), access setState call
         * from state object and test by callback.
         */
        expect(moduleState.setState.numEvents).toHaveBeenCalled();
        const stateCb = moduleState.setState.numEvents.mock.calls[0][0];
        expect(stateCb(1)).toEqual(2);
        expect(stateCb(5)).toEqual(6);
      });
    });

  });
});
