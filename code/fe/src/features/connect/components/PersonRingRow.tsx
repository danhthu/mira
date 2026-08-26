import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '@/shared/components/Avatar';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import type { RelationshipStatus } from '../logic/relationship';

interface PersonRingRowProps {
  status: RelationshipStatus;
  onLogMeeting: () => void;
}

export function PersonRingRow({ status, onLogMeeting }: PersonRingRowProps) {
  const { person, daysSinceLastMet } = status;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onLogMeeting}
      activeOpacity={0.7}
    >
      <Avatar name={person.name} size={40} />
      <View style={styles.text}>
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.meta}>
          {daysSinceLastMet === null
            ? vi.connect.neverMet
            : vi.connect.lastMet(daysSinceLastMet)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  text: { flex: 1 },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: fontSize.meta,
    // Xám trung tính cho mọi khoảng cách. Lâu chưa gặp là dữ kiện, không phải lỗi
    // của người dùng, nên không có thang màu nóng dần ở đây.
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default PersonRingRow;
