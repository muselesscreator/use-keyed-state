# `useKeyedState` - keyed react state hook
Simple wrapper for useState that adds a key to the call, allowing independent tracking of state calls and values, independent of the order of their calls.
Provides a mocking util for useKeyedState that allows simplified mocking and testing of this pattern.
## Usage
Define a keystore (for checking against) of state keys;
```js
import { useKeyedState, StrictDict } from '@edx/use-keyed-state';
const state = StrictDict({
  field1: 'field1',
  field2: 'field2',
  field3: 'field3',
]);
// when initializing, use a state key as the first argument to make the calls uniquely identifiable.
const useMyComponentData = () => {
  const [field1, setField1] = useKeyedState(stateKeys.field1, initialValue);
};
```

When using Typescript, define the type of the state value being stored when calling the hook.
```ts
const [numberField, setNumberField] = useKeyedState<number>(...);
const [complexTypeObj, setComplexTypeObj] = useKeyedState<complexType>(...);
```
## Testing pattern
### Setup
1. Mock useKeyedState to return a mock function
    _Testing with jest_
    ```js
    import { useKeyedState } from '@muselesscreator/use-keyed-state';
    jest.mock('@muselesscreator/useKeyedState`, () => ({ useKeyedState.jest.fn() }));
    ```

    _Testing with vitest_
    ```js
    import { vi } from 'vitest';
    import { useKeyedState } from '@muselesscreator/use-keyed-state';
    vi.mock('@muselesscreator/use-keyed-state', () => ({ useKeyedState: vi.fn() }));
    ```

2. Locally define objects for current values, setState methods, and initial values
    ```js
    // current values for the state fields
    const stateValues = {
     [stateKeys.key1]: 'test-value-1',
     [stateKeys.key2]: 'test-value-2',
     [stateKeys.key3]: 'test-value-3',
    };
    // initial values for the state fields
    const initValues = {
     [stateKeys.key1]: null,
     [stateKeys.key2]: null,
     [stateKeys.key3]: null,
    };
    // setState methods for the state fields
    const setState = {
     [stateKeys.key1]: vi.fn(), // jest.fn(),
     [stateKeys.key2]: vi.fn(), // jest.fn(),
     [stateKeys.key3]: vi.fn(), // jest.fn(),
    };
    ```
    Note: for typescript, you will need to define a type for the initial values object
    ```ts
    const initValues = {
     [stateKeys.key1]: null,
     [stateKeys.key2]: null,
     [stateKeys.key3]: null,
    } as Record<string, unknown>;
    ```
3. Mock the useKeyedState hook to update the initValues object and return the current value and setState method
  ```js
  useKeyedState.mockImplementation((key, val) => {
    initValues[key] = val;
    return [stateValues[key], setState[key]];
  });
  ```
  For typescript, you will need to cast the method as a Mock to override ite implementation.
  _Testing using jest_
  ```ts
  (useKeyedState as jest.Mock).mockImplementation(...);
  ```
  _Testing using vitest_
  ```ts
  import { ..., Mock } from 'vitest';
  (useKeyedState as Mock).mockImplementation(...);
  ```

### Testing
1. Call the hook
2. Use initial-values object to validate initial state values
3. Use current-values object to validate access to the state values
4. Use setState-methods object to validate state updates
5. Reset the initial-values object to null for each field before each test
    ```js
    const resetInitialValues = () => {
      Object.keys(initialValues).forEach(key => {
        initValues[key] = null;
      });
    };
    ```

### Example
#### JavaScript
_Example Hook_
```js
export const stateKeys = {
  numberValue: 'number-value',
  stringValue: 'string-value',
};
export const useMyHook = () => {
  const [numberValue, setNumberValue] = useKeyedState(stateKeys.numberValue, 0);
  const [stringValue, setStringValue] = useKeyedState('');
  return {
    numberValue,
    stringValue,
    numberValueSetter,
    stringValueEventCallback: (e) => setStringValue(e.target.value),
  };
};
export default useMyHook;
```
_Simple test example_
```js
import { useKeyedState } from '@muselesscreator/use-keyed-state';
import useMyHook, { stateKeys } from './useMyHook';

jest.mock('@muselesscreator/use-keyed-state', () => ({
  useKeyedState: jest.fn(),
}));

// current values for the state fields
const stateValues = {
 [stateKeys.numberValue]: 23,
 [stateKeys.stringValue]: 'test-value',
};
// initial values for the state fields
const initValues = {
 [stateKeys.numberValue]: null,
 [stateKeys.stringValue]: null,
};
// setState methods for the state fields
const setState = {
 [stateKeys.numberValue]: jest.fn(),
 [stateKeys.stringValue]: jest.fn(),
};
useKeyedState.mockImplementation((key, val) => {
  initValues[key] = val;
  return [stateValues[key], setState[key]];
});
describe('useMyHook', () => {
  beforeEach(() => {
    resetInitialValues();
  });
  test('initial values', () => {
    const out = useMyHook();
    expect(initValues[stateKeys.numberValue]).toEqual(0);
    expect(initValues[stateKeys.stringValue]).toEqual('');
  });
  test('value and setters', () => {
    const out = useMyHook();
    expect(out.numberValue).toEqual(stateValues[stateKeys.numberValue]);
    expect(out.stringValue).toEqual(stateValues[stateKeys.stringValue]);
    expect(out.numberValueSetter).toEqual(setState[stateKeys.numberValue]);
    out.stringValueEventCallback({ target: { value: testValue } });
    expect(setState[stateKeys.stringValue]).toHaveBeenCalledWith(testValue);
  });
});
```

#### TypeScript
_Example Hook_
```ts
export const stateKeys = {
  numberValue: 'number-value',
  stringValue: 'string-value',
};
export const useMyHook = () => {
  const [numberValue, setNumberValue] = useKeyedState<number>(stateKeys.numberValue, 0);
  const [stringValue, setStringValue] = useKeyedState<string>('');
  return {
    numberValue,
    stringValue,
    numberValueSetter,
    stringValueEventCallback: (e) => setStringValue(e.target.value),
  };
};
export default useMyHook;
```
_Simple test example_
```ts
import { useKeyedState } from '@muselesscreator/use-keyed-state';
import useMyHook, { stateKeys } from './useMyHook';

jest.mock('@muselesscreator/use-keyed-state', () => ({
  useKeyedState: jest.fn(),
}));

// current values for the state fields
const stateValues = {
 [stateKeys.numberValue]: 23,
 [stateKeys.stringValue]: 'test-value',
};
// initial values for the state fields
const initValues = {
 [stateKeys.numberValue]: null,
 [stateKeys.stringValue]: null,
} as Record<string, unknown>;
// setState methods for the state fields
const setState = {
 [stateKeys.numberValue]: jest.fn(),
 [stateKeys.stringValue]: jest.fn(),
};
(useKeyedState as jest.Mock).mockImplementation((key, val) => {
  initValues[key] = val;
  return [stateValues[key], setState[key]];
});
describe('useMyHook', () => {
  beforeEach(() => {
    resetInitialValues();
  });
  test('initial values', () => {
    const out = useMyHook();
    expect(initValues[stateKeys.numberValue]).toEqual(0);
    expect(initValues[stateKeys.stringValue]).toEqual('');
  });
  test('value and setters', () => {
    const out = useMyHook();
    expect(out.numberValue).toEqual(stateValues[stateKeys.numberValue]);
    expect(out.stringValue).toEqual(stateValues[stateKeys.stringValue]);
    expect(out.numberValueSetter).toEqual(setState[stateKeys.numberValue]);
    out.stringValueEventCallback({ target: { value: testValue } });
    expect(setState[stateKeys.stringValue]).toHaveBeenCalledWith(testValue);
  });
});
```

### API
API documentation available at https://muselesscreator.github.io/use-keyed-state/
