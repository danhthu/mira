import { useEffect, useState } from 'react';
import { getSyncEngine } from './SyncEngine';
import { SyncStatus } from './types';

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(() => getSyncEngine().status());
  useEffect(() => getSyncEngine().onStatusChanged(setStatus), []);
  return status;
}
