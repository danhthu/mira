/** Khối dựng chung của module. Màu chỉ lấy từ token, không hex nào viết ở đây. */

import { ReactNode } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { fontSize, radius, space, useColorToken, useTheme } from '../../../theme';

export const Surface = ({
  children,
  testID,
}: {
  readonly children: ReactNode;
  readonly testID?: string;
}) => {
  const token = useColorToken();
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: token.surface,
        borderColor: token.border,
        borderWidth: 1,
        borderRadius: radius.large,
        padding: space.lg,
        marginBottom: space.lg,
      }}
    >
      {children}
    </View>
  );
};

export const Title = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text style={{ color: token.textPrimary, fontSize: fontSize.title }}>{children}</Text>
  );
};

export const Headline = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text
      style={{
        color: token.textPrimary,
        fontSize: fontSize.bodyLarge,
        marginTop: space.md,
      }}
    >
      {children}
    </Text>
  );
};

export const Note = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text
      style={{ color: token.textSecondary, fontSize: fontSize.body, marginTop: space.xxs }}
    >
      {children}
    </Text>
  );
};

export const Muted = ({ children }: { readonly children: string }) => {
  const token = useColorToken();
  return (
    <Text style={{ color: token.textMuted, fontSize: fontSize.caption }}>{children}</Text>
  );
};

export type ButtonTone = 'accent' | 'quiet' | 'destructive';

export const Button = ({
  label,
  onPress,
  tone,
  disabled,
  testID,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly tone: ButtonTone;
  readonly disabled?: boolean;
  readonly testID: string;
}) => {
  const token = useColorToken();
  const background =
    tone === 'accent'
      ? token.accent
      : tone === 'destructive'
        ? token.destructiveSurface
        : token.surfaceMuted;
  const label_color =
    tone === 'accent'
      ? token.textOnAccent
      : tone === 'destructive'
        ? token.destructive
        : token.textSecondary;
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? token.surfaceSunken : background,
        borderRadius: radius.pill,
        paddingVertical: space.sm,
        paddingHorizontal: space.lg,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: disabled ? token.textMuted : label_color,
          fontSize: fontSize.body,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const Sheet = ({
  visible,
  onClose,
  children,
  testID,
}: {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly testID: string;
}) => {
  const token = useColorToken();
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        testID={testID}
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: space.lg,
          backgroundColor: theme.hexToRGB(token.scrim, 0.5),
        }}
      >
        <View
          style={{
            backgroundColor: token.background,
            borderRadius: radius.large,
            padding: space.lg,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

export const Row = ({ children }: { readonly children: ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
    {children}
  </View>
);
