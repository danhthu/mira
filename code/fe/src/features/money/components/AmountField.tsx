import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSize, radius } from '@/shared/theme/tokens';

interface AmountFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}

/** Chỉ nhận chữ số: tiền lưu số nguyên VND, không có dấu phẩy thập phân. */
export function AmountField({ label, value, onChangeText }: AmountFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(raw) => onChangeText(raw.replace(/\D/g, ''))}
        keyboardType="number-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: {
    fontSize: fontSize.meta,
    color: colors.textLabel,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fontSize.bodyLarge,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default AmountField;
