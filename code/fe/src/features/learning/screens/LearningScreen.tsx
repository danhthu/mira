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
import Button from '@/shared/components/Button';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import {
  findMomentsByKind,
  createMoment,
} from '@/db/repositories/momentRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { getCurrentISOString } from '@/shared/utils/date';
import type { Moment } from '@/db/schema';

interface YearSection {
  year: string;
  isCurrentYear: boolean;
  data: Moment[];
}

function groupByYear(notes: Moment[], currentYear: string): YearSection[] {
  const byYear = new Map<string, Moment[]>();
  for (const note of notes) {
    const year = note.occurredAt.slice(0, 4);
    const existing = byYear.get(year);
    if (existing !== undefined) {
      existing.push(note);
    } else {
      byYear.set(year, [note]);
    }
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, data]) => ({ year, isCurrentYear: year === currentYear, data }));
}

export function LearningScreen() {
  const [notes, setNotes] = useState<Moment[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    findMomentsByKind('learn')
      .then((rows) => {
        if (!cancelled) setNotes(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(): Promise<void> {
    const text = draft.trim();
    if (!text) return;
    const created = await createMoment({
      occurredAt: getCurrentISOString(),
      text,
      bucket: 'learn',
      kind: 'learn',
    });
    setNotes((prev) => [created, ...prev]);
    setDraft('');
    setAddVisible(false);
  }

  const sections = groupByYear(notes, String(new Date().getFullYear()));

  return (
    <SafeAreaView style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={(note) => note.id}
        renderItem={({ item }) => (
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>{item.text}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.year}</Text>
            {/* Năm đã khép lại thì danh sách này chính là bản tổng kết. */}
            {!section.isCurrentYear && (
              <Text style={styles.sectionSubtitle}>
                {vi.learning.changedMyMind}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <DataState
            message={vi.learning.emptyState}
            action={{
              label: vi.learning.addIdea,
              onPress: () => setAddVisible(true),
            }}
          />
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
            <Text style={styles.modalTitle}>{vi.learning.ideas}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={vi.learning.addIdea}
              value={draft}
              onChangeText={setDraft}
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
                disabled={!draft.trim()}
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
  safe: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, paddingBottom: 80 },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noteRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  noteText: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabIcon: { color: colors.textOnAccent, fontSize: 28, lineHeight: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: fontSize.body,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalActionButton: { flex: 1 },
});

export default LearningScreen;
