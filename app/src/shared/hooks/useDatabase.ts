import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/db/client';

interface DatabaseState {
  isReady: boolean;
  error: Error | null;
}

export function useDatabase(): DatabaseState {
  const [state, setState] = useState<DatabaseState>({
    isReady: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    initializeDatabase()
      .then(() => {
        if (!cancelled) {
          setState({ isReady: true, error: null });
        }
      })
      .catch((raw: unknown) => {
        if (!cancelled) {
          const error =
            raw instanceof Error ? raw : new Error(String(raw));
          setState({ isReady: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
