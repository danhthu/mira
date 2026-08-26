import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { findSharedModuleLabels } from '../logic/spaceRules';
import Card from '@/shared/components/Card';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import { formatPersonIds } from '@/shared/utils/format';
import type { Person, Space } from '@/db/schema';

interface SpaceCardProps {
  space: Space;
  persons: Person[];
}

export function SpaceCard({ space, persons }: SpaceCardProps) {
  const memberIds = formatPersonIds(space.memberIds);
  const memberNames = persons
    .filter((person) => memberIds.includes(person.id))
    .map((person) => person.name);
  const moduleLabels = findSharedModuleLabels(
    formatPersonIds(space.sharedModules),
  );

  return (
    <Card>
      <Text style={styles.name}>{space.name}</Text>
      <Text style={styles.label}>{vi.space.members}</Text>
      <Text style={styles.value}>{memberNames.join(', ')}</Text>
      {moduleLabels.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.label}>{vi.space.sharedModules}</Text>
          <Text style={styles.value}>{moduleLabels.join(', ')}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  block: { marginTop: 12 },
  label: { fontSize: fontSize.caption, color: colors.textMuted },
  value: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default SpaceCard;
