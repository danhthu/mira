import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MomentItem from '../components/MomentItem';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import { findAllMoments, createMoment } from '@/db/repositories/momentRepository';
import { findAllPersons } from '@/db/repositories/personRepository';
import { getCurrentISOString, formatDisplayMonth } from '@/shared/utils/date';
import type { Moment, Person } from '@/db/schema';

interface Section {
  title: string;
  data: Moment[];
}

function groupByMonth(moments: Moment[]): Section[] {
  const map = new Map<string, Moment[]>();
  for (const m of moments) {
    const monthKey = m.occurredAt.slice(0, 7);
    const existing = map.get(monthKey);
    if (existing !== undefined) {
      existing.push(m);
    } else {
      map.set(monthKey, [m]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({
      title: formatDisplayMonth(key),
      data,
    }));
}

export function MomentsScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([findAllMoments(), findAllPersons()])
      .then(([m, p]) => {
        if (!cancelled) {
          setMoments(m);
          setPersons(p);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(): Promise<void> {
    const text = newText.trim();
    if (!text) return;
    const created = await createMoment({
      occurredAt: getCurrentISOString(),
      text,
    });
    setMoments((prev) => [created, ...prev]);
    setNewText('');
    setAddVisible(false);
  }

  const sections = groupByMonth(moments);

  return (
    <SafeAreaView style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MomentItem moment={item} persons={persons} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>
              {vi.moments.monthSummary(
                section.title,
                section.data.length,
              )}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{vi.moments.emptyState}</Text>
        }
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={addVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.moments.addButton}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={vi.moments.textPlaceholder}
              value={newText}
              onChangeText={setNewText}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                label={vi.moments.cancel}
                onPress={() => setAddVisible(false)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.moments.save}
                onPress={() => void handleSave()}
                disabled={!newText.trim()}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { paddingBottom: 80 },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  sectionCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B5BDB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, lineHeight: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalActionButton: { flex: 1 },
});

export default MomentsScreen;
