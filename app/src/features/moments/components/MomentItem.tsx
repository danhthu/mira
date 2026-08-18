import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from '@/shared/components/Avatar';
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
    borderBottomColor: '#F3F4F6',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  personTagName: {
    fontSize: 12,
    color: '#3B5BDB',
  },
});

export default MomentItem;
