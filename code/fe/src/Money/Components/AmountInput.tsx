import { useEffect, useState } from 'react';
import { Text, TextInput, TextStyle, TouchableOpacity, View } from 'react-native';
import { useColorToken, fontSize, radius, space } from '../../../theme';
import { groupThousands, parseAmount } from '../Models/format';

/**
 * Công tắc "đang nợ nhiều hơn có" cho ô tài sản ròng. Người dùng gõ độ lớn, công
 * tắc quyết định dấu — nhờ vậy không có dấu trừ nào trên bàn phím lẫn trên màn hình,
 * đúng `03-formulas.md` §3 biên.
 */
export interface BelowZeroToggle {
  readonly label: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly testID: string;
}

export interface AmountInputProps {
  readonly label: string;
  readonly hint: string;
  readonly unit: string;
  /** `null` khi ô còn trống. Ô trống không bao giờ hiện số 0. */
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly belowZero?: BelowZeroToggle;
  readonly testID: string;
}

function displayOf(value: number | null): string {
  return value === null ? '' : groupThousands(String(value));
}

/**
 * Ô nhập tiền VND. Tách nhóm nghìn ngay lúc gõ và chỉ nhận chữ số, nên giá trị ra
 * luôn là số nguyên VND — không có đường nào tạo ra số thập phân (anti-AI rule #8).
 */
export const AmountInput = (props: AmountInputProps) => {
  const token = useColorToken();
  const belowZero = props.belowZero;
  const [text, setText] = useState(() => displayOf(props.value));
  // `outlineColor` là style riêng của react-native-web, bản gõ của react-native không
  // khai nó. Ép kiểu ở đây để vòng focus lấy token của app: màu mặc định của trình
  // duyệt nằm trong dải cam, thứ không được xuất hiện trên màn tiền (ràng buộc #3).
  const focusRing = { outlineColor: token.accent } as TextStyle;

  // Đồng bộ khi giá trị bị đổi từ bên ngoài (nạp xong bản ghi tháng trước).
  useEffect(() => {
    if (parseAmount(text) !== props.value) setText(displayOf(props.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  return (
    <View style={{ marginBottom: space.lg }}>
      <Text
        style={{
          color: token.textPrimary,
          fontSize: fontSize.body,
          marginBottom: space.xxs,
        }}
      >
        {props.label}
      </Text>
      <Text
        style={{
          color: token.textMuted,
          fontSize: fontSize.caption,
          marginBottom: space.sm,
        }}
      >
        {props.hint}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: token.surface,
          borderColor: token.border,
          borderWidth: 1,
          borderRadius: radius.normal,
          paddingHorizontal: space.md,
        }}
      >
        <TextInput
          testID={props.testID}
          value={text}
          onChangeText={(next) => {
            const amount = parseAmount(next);
            setText(displayOf(amount));
            props.onChange(amount);
          }}
          keyboardType="number-pad"
          inputMode="numeric"
          style={[
            {
              flex: 1,
              color: token.textPrimary,
              fontSize: fontSize.title,
              paddingVertical: space.md,
            },
            focusRing,
          ]}
        />
        <Text style={{ color: token.textSecondary, fontSize: fontSize.subtitle }}>
          {props.unit}
        </Text>
      </View>
      {belowZero && (
        <TouchableOpacity
          testID={belowZero.testID}
          accessibilityRole="button"
          onPress={() => belowZero.onChange(!belowZero.value)}
          style={{
            marginTop: space.sm,
            alignSelf: 'flex-start',
            backgroundColor: belowZero.value ? token.accentSurface : token.surfaceMuted,
            borderColor: belowZero.value ? token.accentMuted : token.border,
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingVertical: space.xs,
            paddingHorizontal: space.md,
          }}
        >
          <Text style={{ color: token.textSecondary, fontSize: fontSize.caption }}>
            {belowZero.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
