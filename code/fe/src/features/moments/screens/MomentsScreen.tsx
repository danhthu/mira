import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MomentItem from '../components/MomentItem';
import Button from '@/shared/components/Button';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import {
  findMomentsByKind,
  createMoment,
} from '@/db/repositories/momentRepository';
import { findAllPersons } from '@/db/repositories/personRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
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
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([findMomentsByKind('moment'), findAllPersons()])
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

  async function handlePickPhoto(): Promise<void> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSave(): Promise<void> {
    const text = newText.trim();
    if (!text && !newPhotoUri) return;
    const created = await createMoment({
      occurredAt: getCurrentISOString(),
      text: text || undefined,
      mediaUri: newPhotoUri ?? undefined,
      mediaType: newPhotoUri ? 'photo' : undefined,
      kind: 'moment',
    });
    setMoments((prev) => [created, ...prev]);
    setNewText('');
    setNewPhotoUri(null);
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
          <DataState
            message={vi.moments.emptyState}
            action={{
              label: vi.moments.addButton,
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
            <Text style={styles.modalTitle}>{vi.moments.addButton}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={vi.moments.textPlaceholder}
              value={newText}
              onChangeText={setNewText}
              multiline
              autoFocus
            />
            {newPhotoUri ? (
              <Image source={{ uri: newPhotoUri }} style={styles.previewImage} />
            ) : (
              <Button
                label={vi.moments.addPhoto}
                onPress={() => void handlePickPhoto()}
                variant="ghost"
                style={styles.addPhotoButton}
              />
            )}
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
                disabled={!newText.trim() && !newPhotoUri}
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
  list: { paddingBottom: 80 },
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
  sectionCount: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.body,
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
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
    marginTop: 12,
  },
  addPhotoButton: { marginTop: 12 },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalActionButton: { flex: 1 },
});

export default MomentsScreen;
