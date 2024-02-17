import React from 'react';

export const useKeyedState = (_: string, val: NonNullable<unknown>): unknown => React.useState(val);

export default { useKeyedState };
