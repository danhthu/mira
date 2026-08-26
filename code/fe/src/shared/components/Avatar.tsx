import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme/tokens';

interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const initials = getInitials(name);
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.avatarSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.accent,
    fontWeight: '600',
  },
});

export default Avatar;
