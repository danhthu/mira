import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SpaceCard from '../components/SpaceCard';
import {
  MAX_CIRCLE_MEMBERS,
  PAIR_MEMBER_COUNT,
  SHARED_MODULE_OPTIONS,
  canAddMember,
  isMemberCountValid,
} from '../logic/spaceRules';
import type { SpaceType } from '../logic/spaceRules';
import Avatar from '@/shared/components/Avatar';
import Button from '@/shared/components/Button';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { findAllPersons } from '@/db/repositories/personRepository';
import { createSpace, findAllSpaces } from '@/db/repositories/spaceRepository';
import type { Person, Space } from '@/db/schema';

export function SpaceScreen() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [draftType, setDraftType] = useState<SpaceType | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([]);
  const [draftModules, setDraftModules] = useState<string[]>([]);

  const load = useCallback(async () => {
    const [loadedSpaces, loadedPersons] = await Promise.all([
      findAllSpaces(),
      findAllPersons(),
    ]);
    setSpaces(loadedSpaces);
    setPersons(loadedPersons);
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setSpaces([]);
    });
  }, [load]);

  function openDraft(type: SpaceType): void {
    setDraftType(type);
    setDraftName('');
    setDraftMemberIds([]);
    setDraftModules([]);
  }

  function toggleMember(type: SpaceType, personId: string): void {
    setDraftMemberIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : canAddMember(type, prev.length)
          ? [...prev, personId]
          : prev,
    );
  }

  function toggleModule(moduleKey: string): void {
    setDraftModules((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((key) => key !== moduleKey)
        : [...prev, moduleKey],
    );
  }

  async function handleSaveDraft(type: SpaceType): Promise<void> {
    await createSpace({
      type,
      name: draftName.trim(),
      memberIds: draftMemberIds,
      sharedModules: draftModules,
    });
    setDraftType(null);
    await load();
  }

  const draftSavable =
    draftType !== null &&
    draftName.trim() !== '' &&
    isMemberCountValid(draftType, draftMemberIds.length);

  return (
    <SafeAreaView style={styles.safe}>
      {spaces.length === 0 ? (
        // Không kèm action ở đây: hai nút tạo nằm sẵn ở thanh dưới, thêm nút thứ
        // ba cùng chữ chỉ làm màn hình rỗng trông rối hơn.
        <DataState message={vi.space.emptyState} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {spaces.map((item) => (
            <SpaceCard key={item.id} space={item} persons={persons} />
          ))}
        </ScrollView>
      )}

      <View style={styles.createBar}>
        <Button
          label={vi.space.createPair}
          variant="secondary"
          onPress={() => openDraft('pair')}
          style={styles.createButton}
        />
        <Button
          label={vi.space.createCircle}
          variant="secondary"
          onPress={() => openDraft('circle')}
          style={styles.createButton}
        />
      </View>

      <Modal
        visible={draftType !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setDraftType(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {draftType !== null && (
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>
                {draftType === 'pair'
                  ? vi.space.createPair
                  : vi.space.createCircle}
              </Text>
              <TextInput
                style={styles.nameInput}
                placeholder={vi.space.spaceName}
                value={draftName}
                onChangeText={setDraftName}
                autoFocus
              />

              <Text style={styles.sectionLabel}>
                {vi.space.members}
                {'  '}
                {draftMemberIds.length}/
                {draftType === 'pair' ? PAIR_MEMBER_COUNT : MAX_CIRCLE_MEMBERS}
              </Text>
              <ScrollView style={styles.memberList}>
                {persons.map((person) => {
                  const selected = draftMemberIds.includes(person.id);
                  return (
                    <TouchableOpacity
                      key={person.id}
                      style={[
                        styles.memberRow,
                        selected && styles.memberRowOn,
                      ]}
                      onPress={() => toggleMember(draftType, person.id)}
                      activeOpacity={0.7}
                    >
                      <Avatar name={person.name} size={32} />
                      <Text style={styles.memberName}>{person.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionLabel}>{vi.space.sharedModules}</Text>
              <View style={styles.moduleRow}>
                {SHARED_MODULE_OPTIONS.map((option) => {
                  const selected = draftModules.includes(option.key);
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.chip, selected && styles.chipOn]}
                      onPress={() => toggleModule(option.key)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          selected && styles.chipLabelOn,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalActions}>
                <Button
                  label={vi.today.cancel}
                  variant="ghost"
                  onPress={() => setDraftType(null)}
                  style={styles.modalActionButton}
                />
                <Button
                  label={vi.today.save}
                  onPress={() => void handleSaveDraft(draftType)}
                  disabled={!draftSavable}
                  style={styles.modalActionButton}
                />
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12 },
  createBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  createButton: { flex: 1, paddingHorizontal: 8 },
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
  nameInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: fontSize.meta,
    color: colors.textLabel,
    marginTop: 16,
    marginBottom: 8,
  },
  memberList: { maxHeight: 200 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 6,
  },
  memberRowOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  memberName: { fontSize: fontSize.body, color: colors.textPrimary },
  moduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accentSurface },
  chipLabel: { fontSize: fontSize.small, color: colors.textSecondary },
  chipLabelOn: { color: colors.accent, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalActionButton: { flex: 1 },
});

export default SpaceScreen;
