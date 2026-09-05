import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTSIZE } from '../../../theme/Constraints';
import { useTheme } from '../../../theme';
import { syncText } from './Text';
import { useSyncStatus } from './useSyncStatus';
import { SyncStatus } from './types';

export function describeSyncStatus(status: SyncStatus): string {
  if (!status.enabled) return syncText.statusOff;

  const head = status.running
    ? syncText.statusRunning
    : status.lastSyncedAt === null
      ? syncText.statusNever
      : syncText.lastSyncedAt(status.lastSyncedAt);

  const tail =
    status.pending === 0 ? syncText.pendingNone : syncText.pending(status.pending);

  return head + syncText.separator + tail;
}

/**
 * Một dòng chữ nhỏ, màu xám của chữ phụ. Cố ý không dùng `colors.error` hay bất kỳ
 * sắc đỏ/cam nào: ràng buộc cứng #3 cấm dùng màu cảnh báo để nói người dùng làm
 * chưa đủ, và mục đang chờ đồng bộ không phải lỗi của họ.
 */
export const SyncStatusLine = () => {
  const colors = useTheme();
  const status = useSyncStatus();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
        {describeSyncStatus(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 4,
  },
  text: {
    fontSize: FONTSIZE.SSMALL,
  },
});
