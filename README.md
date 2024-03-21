# use-keyed-state

Simple wrapper for useState that adds a key to the call, allowing independent tracking of state calls and values, independent of the order of their calls.
Provides a mocking util for useKeyedState that allows simplified mocking and testing of this pattern.

## Utilities

### `useKeyedState` - React state hook wrapper
This is a simple wrapper for useState that allows it to be more directly testable by assigning keys to each call.
#### Usage
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
### Testing pattern for useKeyedState

#### Setup:
1. Mock useKeyedState to return a mock function
```js
import { useKeyedState } from '@muselesscreator/use-keyed-state';

// For Vitest
vi.mock('@muselesscreator/use-keyed-state', () => ({ useKeyedState: vi.fn() }));
// For Jest
// jest.mock('@muselesscreator/use-keyed-state', () => ({ useKeyedState: jest.fn() }));
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
3. Mock the useKeyedState hook to update the initValues object and return the current value and setState method
```js
useKeyedState.mockImplementation((key, val) => {
  initValues[key] = val;
  return [stateValues[key], setState[key]];
});
```
#### Testing:
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
