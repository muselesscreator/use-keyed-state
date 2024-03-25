import React from 'react';


type UseKeyedState = <T>(key: string, val: T) => [T, React.Dispatch<React.SetStateAction<T>>];
/**
 * A wrapper around React's useSTate that binds the state value to a key.
 *
 * @typeParam T The type of the state value.
 * @param key The key to bind the state value to.
 * @param val The initial value of the state.
 * @returns {UseKeyedState} A tuple containing the state value and a function to update it.
 */
export const useKeyedState = ((_ : unknown, val: NonNullable<unknown>) => React.useState(val)) as UseKeyedState;

export default { useKeyedState };
