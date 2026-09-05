import { Text, TouchableOpacity } from 'react-native';
import { useColorToken, fontSize, radius, space } from '../../../theme';

export interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly testID: string;
}

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const token = useColorToken();
  return (
    <TouchableOpacity
      testID={props.testID}
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={props.onPress}
      style={{
        backgroundColor: props.disabled ? token.surfaceSunken : token.accent,
        borderRadius: radius.pill,
        paddingVertical: space.md,
        paddingHorizontal: space.xl,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: props.disabled ? token.textMuted : token.textOnAccent,
          fontSize: fontSize.subtitle,
        }}
      >
        {props.label}
      </Text>
    </TouchableOpacity>
  );
};
