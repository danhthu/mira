import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import {
  findLettersByKind,
  createLetter,
} from '@/db/repositories/letterRepository';
import {
  findMomentsByKind,
  createMoment,
} from '@/db/repositories/momentRepository';
import { findAllPersons } from '@/db/repositories/personRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { getCurrentISOString, todayYMD } from '@/shared/utils/date';
import type { Letter, Moment, Person } from '@/db/schema';
import { isLetterSealed, letterOpenDate, formatDayMonthYear } from '../letterSeal';

type Composer = 'letter' | 'box';

export function LegacyScreen() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [boxEntries, setBoxEntries] = useState<Moment[]>([]);
  const [childIds, setChildIds] = useState<string[]>([]);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [draft, setDraft] = useState('');
  const [draftPhotoUri, setDraftPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      findLettersByKind('yearLetter'),
      findMomentsByKind('legacy'),
      findAllPersons(),
    ])
      .then(([letterRows, momentRows, persons]) => {
        if (cancelled) return;
        setLetters(letterRows);
        setChildIds(
          persons.filter((p: Person) => p.role === 'child').map((p) => p.id),
        );
        setBoxEntries(momentRows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function closeComposer(): void {
    setComposer(null);
    setDraft('');
    setDraftPhotoUri(null);
  }

  async function handlePickPhoto(): Promise<void> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setDraftPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSaveLetter(): Promise<void> {
    const body = draft.trim();
    if (!body) return;
    // Ngày viết thật, không phải đầu tuần: lấy `weekStart` thì thư viết Chủ nhật
    // mở sớm 6 ngày, và hai lá viết cùng tuần lại có chung một ngày mở.
    const created = await createLetter({
      weekStart: todayYMD(),
      body,
      kind: 'yearLetter',
    });
    setLetters((prev) => [created, ...prev]);
    closeComposer();
  }

  async function handleSaveBoxEntry(): Promise<void> {
    const text = draft.trim();
    if (!text && draftPhotoUri === null) return;
    const created = await createMoment({
      occurredAt: getCurrentISOString(),
      text: text || undefined,
      mediaUri: draftPhotoUri ?? undefined,
      mediaType: draftPhotoUri !== null ? 'photo' : undefined,
      personIds: childIds,
      kind: 'legacy',
    });
    setBoxEntries((prev) => [created, ...prev]);
    closeComposer();
  }

  const today = todayYMD();
  const nothingYet = letters.length === 0 && boxEntries.length === 0;

  if (nothingYet) {
    return (
      <SafeAreaView style={styles.safe}>
        <DataState
          message={vi.legacy.emptyState}
          action={{
            label: vi.legacy.letterToSelf,
            onPress: () => setComposer('letter'),
          }}
        />
        {renderComposer()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{vi.legacy.letterToSelf}</Text>
        {letters.map((letter) => {
          const sealed = isLetterSealed(letter.weekStart, today);
          return (
            <Card key={letter.id} style={styles.card}>
              <Text style={styles.cardMeta}>
                {vi.legacy.sealedUntil(
                  formatDayMonthYear(letterOpenDate(letter.weekStart)),
                )}
              </Text>
              {/* Trước ngày mở, nội dung không hiện — đó là điểm của tính năng. */}
              {!sealed && <Text style={styles.cardBody}>{letter.body}</Text>}
            </Card>
          );
        })}
        <Button
          label={vi.legacy.sealLetter}
          onPress={() => setComposer('letter')}
          variant="secondary"
          style={styles.sectionButton}
        />

        <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
          {vi.legacy.boxForChild}
        </Text>
        {boxEntries.map((entry) => (
          <Card key={entry.id} style={styles.card}>
            {entry.mediaUri !== null && (
              <Image source={{ uri: entry.mediaUri }} style={styles.boxImage} />
            )}
            {entry.text !== null && (
              <Text style={styles.cardBody}>{entry.text}</Text>
            )}
          </Card>
        ))}
        <Button
          label={vi.legacy.addToBox}
          onPress={() => setComposer('box')}
          variant="secondary"
          disabled={childIds.length === 0}
          style={styles.sectionButton}
        />
      </ScrollView>
      {renderComposer()}
    </SafeAreaView>
  );

  function renderComposer() {
    const isLetter = composer === 'letter';
    const canSave = isLetter
      ? draft.trim().length > 0
      : draft.trim().length > 0 || draftPhotoUri !== null;

    return (
      <Modal
        visible={composer !== null}
        animationType="slide"
        transparent
        onRequestClose={closeComposer}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {isLetter ? vi.legacy.letterToSelf : vi.legacy.addToBox}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={
                isLetter ? vi.legacy.letterBody : vi.moments.textPlaceholder
              }
              value={draft}
              onChangeText={setDraft}
              multiline
              autoFocus
            />
            {!isLetter &&
              (draftPhotoUri !== null ? (
                <Image
                  source={{ uri: draftPhotoUri }}
                  style={styles.previewImage}
                />
              ) : (
                <Button
                  label={vi.moments.addPhoto}
                  onPress={() => void handlePickPhoto()}
                  variant="ghost"
                  style={styles.addPhotoButton}
                />
              ))}
            <View style={styles.modalActions}>
              <Button
                label={vi.moments.cancel}
                onPress={closeComposer}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={isLetter ? vi.legacy.sealLetter : vi.moments.save}
                onPress={() =>
                  void (isLetter ? handleSaveLetter() : handleSaveBoxEntry())
                }
                disabled={!canSave}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  sectionTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionSpaced: { marginTop: 32 },
  sectionButton: { marginTop: 12 },
  card: { marginBottom: 10 },
  cardMeta: { fontSize: fontSize.meta, color: colors.textSecondary },
  cardBody: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: 6,
  },
  boxImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
  },
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
    minHeight: 120,
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
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalActionButton: { flex: 1 },
});

export default LegacyScreen;

