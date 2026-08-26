import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from '@/shared/components/Avatar';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { formatPersonIds } from '@/shared/utils/format';
import type { Moment, Person } from '@/db/schema';

interface MomentItemProps {
  moment: Moment;
  persons: Person[];
}

export function MomentItem({ moment, persons }: MomentItemProps) {
  const personIds = formatPersonIds(moment.personIds);
  const taggedPersons = persons.filter((p) => personIds.includes(p.id));

  const displayTime = new Date(moment.occurredAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{displayTime}</Text>

      {moment.text != null && (
        <Text style={styles.text}>{moment.text}</Text>
      )}

      {moment.mediaUri != null && moment.mediaType === 'photo' && (
        <Image
          source={{ uri: moment.mediaUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {taggedPersons.length > 0 && (
        <View style={styles.personsRow}>
          {taggedPersons.map((p) => (
            <View key={p.id} style={styles.personTag}>
              <Avatar name={p.name} size={20} />
              <Text style={styles.personTagName}>{p.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  time: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 6,
  },
  text: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  personsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  personTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.md,
  },
  personTagName: {
    fontSize: fontSize.caption,
    color: colors.accent,
  },
});

export default MomentItem;
