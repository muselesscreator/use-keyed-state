/**
 * useKeyedState Testing Pattern:
 * Setup:
 * 1. Mock useKeyedState to return a mock function
 * 2. Locally define objects for current values, setState methods, and initial values
 * 3. Mock the useKeyedState hook to update the initValues object and return the current value and setState method
 *
 * Testing:
 * 1. Call the hook
 * 2. Use initial-values object to validate initial state values
 * 3. Use current-values object to validate access to the state values
 * 4. Use setState-methods object to validate state updates
 * 5. Reset the initial-values object to null for each field before each test
 */
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';
import React from 'react';
import getEffects from '@muselesscreator/get-effects';
import { useKeyedState } from '..';

import useExampleComponentData, {
  stateKeys,
  formUrl,
} from './hooks';

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

vi.mock('..', () => ({ useKeyedState: vi.fn() }));

let out;


// Mock ref for shallow testing, to allow hooks to access as normal.
const ref = {
  current: { click: vi.fn(), value: 'test-value' },
};

// current values for the state fields
const stateValues = {
  [stateKeys.importedClicked]: 'importedClicked',
  [stateKeys.loaded]: 'loaded',
  [stateKeys.numEvents]: 'numEvents',
};
// setState methods for the state fields
const setState = {
  [stateKeys.importedClicked]: vi.fn(),
  [stateKeys.loaded]: vi.fn(),
  [stateKeys.numEvents]: vi.fn(),
};
// update-able initial values for the state fields
const initValues = {
  [stateKeys.importedClicked]: null,
  [stateKeys.loaded]: null,
  [stateKeys.numEvents]: null,
};
const resetInitialValues = () => {
  Object.keys(initValues).forEach(key => {
    initValues[key] = null;
  });
};
const mockUseKeyedState = (key, val) => {
  initValues[key] = val;
  return [stateValues[key], setState[key]];
};
useKeyedState.mockImplementation(mockUseKeyedState);

describe('ExampleComponent hooks', () => {
  beforeEach(() => {
    resetInitialValues();
    vi.clearAllMocks();
    React.useRef.mockReturnValue(ref);
  });
  describe('useExampleComponentData hook', () => {
    beforeEach(() => {
      out = useExampleComponentData();
    });
    describe('behavior', () => {
      it('initializes state fields', () => {
        expect(initValues).toEqual({
          [stateKeys.importedClicked]: 0,
          [stateKeys.loaded]: false,
          [stateKeys.numEvents]: 0,
        });
      });
      it('sets loaded to true on initialization', () => {
        /**
         * Use getEffects to load callback passed to useEffect based on prerequisite array
         */
        const [[ cb ]] = React.useEffect.mock.calls;
        cb();
        expect(setState.loaded).toHaveBeenCalledWith(true);
      });
      it('increments numEvents on importClicked or fileChanged', () => {
        /**
         * Use getEffects to load callback passed to useEffect based on prerequisite array
         */
        const cb = getEffects([
          setState.numEvents,
          stateValues.importedClicked,
        ], React)[0];
        cb();
        expect(setState.numEvents).toHaveBeenCalled();
        const stateCb = setState.numEvents.mock.calls[0][0];
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
        expect(out.formAction).toEqual(formUrl);
      });
    });
  });
});
