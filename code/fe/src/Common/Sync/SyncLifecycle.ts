import { AppState, AppStateStatus } from 'react-native';
import { getSyncEngine } from './SyncEngine';

let subscription: { remove: () => void } | undefined;

/**
 * Ba dịp chạy đồng bộ: mở app (`start`), app quay lại foreground, và sau mỗi lần
 * ghi có debounce (engine tự lo). Không có timer chạy liên tục.
 */
export async function startSync(): Promise<void> {
  const engine = getSyncEngine();
  await engine.start();

  if (subscription) return;
  let previous: AppStateStatus = AppState.currentState;
  subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
    if (previous.match(/inactive|background/) && next === 'active') {
      engine.onForeground();
    }
    previous = next;
  });
}

export function stopSync(): void {
  if (subscription) {
    subscription.remove();
    subscription = undefined;
  }
  getSyncEngine().stop();
}
