import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, fontSize } from '@/shared/theme/tokens';

interface DataStateProps {
  /** Câu chính: nói dữ liệu đang thiếu gì, không nói người dùng thiếu gì. */
  message: string;
  /** Câu phụ giải thích, bỏ trống được. */
  hint?: string;
  /**
   * Việc người dùng làm được ngay. Trạng thái rỗng mà không kèm lối đi tiếp thì
   * người ta chỉ biết đứng nhìn — đúng thứ màn Đồng hồ cát đang mắc phải.
   */
  action?: { label: string; onPress: () => void };
}

export function DataState({ message, hint, action }: DataStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {hint !== undefined && <Text style={styles.hint}>{hint}</Text>}
      {action !== undefined && (
        <Button label={action.label} onPress={action.onPress} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: fontSize.body,
    // Xám trung tính, không cam không đỏ: đây là thông tin về dữ liệu,
    // không phải cảnh báo về người dùng.
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  action: { width: '100%' },
});

export default DataState;
