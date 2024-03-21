import React from 'react';

type UseKeyedState = <T>(key: string, val: T) => [T, React.Dispatch<React.SetStateAction<T>>];
export const useKeyedState = ((_ : unknown, val: NonNullable<unknown>) => React.useState(val)) as UseKeyedState;

export default { useKeyedState };
