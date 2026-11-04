import { createContext } from 'react';

/** Visual interaction snapshots for component documentation; events still work normally. */
export const InteractionPreview = createContext<'default' | 'hover' | 'pressed' | 'focus'>('default');
