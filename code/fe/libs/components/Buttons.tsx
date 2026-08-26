import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { FONTSIZE } from '../../theme/Constraints';
import { BICon, ICON_LIST } from './BIcon';

type ButtonProps = {
  text?: string;
  onPress: () => void;
  type?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'link'
  | 'default'
  | 'black';
  disabled?: boolean;
  loading?: boolean;
  icon?: ICON_LIST;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  radius?: number;
  block?: boolean;
  customStyles?: StyleProp<ViewStyle>;
  customTextStyles?: StyleProp<TextStyle>;
  outline?: boolean;
};

const MaterialColors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  link: 'transparent',
  default: '#6c757d',
  black: '#000000',
  disabled: '#E0E0E0',
  disabledText: '#9E9E9E',
};

export const ButtonV2: React.FC<ButtonProps> = ({
  text = null,
  onPress,
  type = 'default',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  size = 'medium',
  radius = 8,
  block = false,
  customStyles = {},
  customTextStyles = {},
  outline = false
}) => {
  const colors = useTheme()
  const sizes = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: FONTSIZE.SMALL,
      iconSize: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: FONTSIZE.NORMAL,
      iconSize: 20,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      fontSize: FONTSIZE.LARGE,
      iconSize: 24,
    },
  };

  const sizeStyle = sizes[size] || sizes.medium;

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    return [
      styles.button,
      { paddingHorizontal: sizeStyle.paddingHorizontal },
      { paddingVertical: sizeStyle.paddingVertical },
      {
        borderRadius: radius,
        borderColor: colors.outline,
        borderWidth: 1
      },
      !disabled && { backgroundColor: MaterialColors[type] || MaterialColors.default },
      disabled && { backgroundColor: MaterialColors.disabled },
      { flexDirection: 'row' },
      customStyles,

    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = [
      styles.text,
      { fontSize: sizeStyle.fontSize },
      customTextStyles,
    ];

    if (disabled) return [...baseTextStyle, { color: MaterialColors.disabledText }];
    if (type === 'light' || type === 'link') {
      return [...baseTextStyle, { color: colors.colorLink }];
    }
    return [...baseTextStyle, { color: '#FFFFFF' }];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(),]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {
        loading ? (
          <ActivityIndicator color={type === 'light' ? MaterialColors.dark : '#FFFFFF'} />
        ) : (
          <View style={[styles.content, icon && iconPosition === 'right' && { flexDirection: 'row-reverse' }]}>
            {icon && (
              <View style={styles.icon}>
                <BICon name={icon} size={sizeStyle.iconSize} color={disabled ? MaterialColors.disabledText : '#FFFFFF'} />
              </View>
            )}
            {text && <Text style={getTextStyle()}>{text}</Text>}
          </View>
        )}
    </TouchableOpacity >
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 0, // Mặc định không có viền
  },
  text: {
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
});


