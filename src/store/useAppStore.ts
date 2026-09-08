import { useState, useEffect } from 'react';
import { mockStore, AppState } from './mockStore';

export type StoreHookResult = [AppState, typeof mockStore] & AppState;

export function useAppStore(): StoreHookResult {
  const [state, setState] = useState<AppState>(() => mockStore.getState());

  useEffect(() => {
    const unsubscribe = mockStore.subscribe(() => {
      // Trigger re-render with fresh reference
      setState({ ...mockStore.getState() });
    });
    return unsubscribe;
  }, []);

  // Return a hybrid tuple + object so both `const [state, store] = useAppStore()`
  // and `const state = useAppStore()` work seamlessly without any regressions.
  const result = [state, mockStore] as unknown as StoreHookResult;
  Object.assign(result, state);

  return result;
}
