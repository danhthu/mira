import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PersonSettingRow from '../components/PersonSettingRow';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import {
  findAllPersons,
  updatePersonHourglass,
  updatePersonBirthYear,
  createPerson,
} from '@/db/repositories/personRepository';
import { findAllTimeEntries } from '@/db/repositories/timeEntryRepository';
import { findAllMoments } from '@/db/repositories/momentRepository';
import { deleteAllLocalData } from '@/db/resetDatabase';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { DEFAULT_CADENCE } from '@/core/constants';
import { useSettingsStore } from '@/store/settingsStore';
import type { Person } from '@/db/schema';
import type { PersonRole } from '@/shared/types';

const WEEKDAY_NAMES = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
];

const ADD_ROLES: PersonRole[] = ['child', 'parent', 'partner', 'friend', 'other'];

export function SettingsScreen() {
  const [persons, setPersons] = useState<Person[]>([]);
  const {
    curfewHour,
    whiteDayOfWeek,
    lifeCountdownEnabled,
    setCurfewHour,
    setWhiteDay,
    setLifeCountdownEnabled,
  } = useSettingsStore();

  const [birthYearTarget, setBirthYearTarget] = useState<Person | null>(null);
  const [birthYearText, setBirthYearText] = useState('');

  const [addPersonVisible, setAddPersonVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<PersonRole>('friend');

  const [curfewPickerVisible, setCurfewPickerVisible] = useState(false);
  const [whiteDayPickerVisible, setWhiteDayPickerVisible] = useState(false);

  async function reloadPersons(): Promise<void> {
    const data = await findAllPersons();
    setPersons(data);
  }

  useEffect(() => {
    void reloadPersons();
  }, []);

  function handleToggleHourglass(person: Person, enabled: boolean): void {
    if (enabled && person.birthYear == null) {
      // R-018/UC-07: bật Đồng hồ cát phải hỏi năm sinh trước, không bật rồi mới báo lỗi.
      setBirthYearTarget(person);
      setBirthYearText('');
      return;
    }
    void updatePersonHourglass(person.id, enabled).then(() =>
      setPersons((prev) =>
        prev.map((p) => (p.id === person.id ? { ...p, hourglassEnabled: enabled } : p)),
      ),
    );
  }

  async function handleConfirmBirthYear(): Promise<void> {
    if (!birthYearTarget) return;
    const year = parseInt(birthYearText, 10);
    const thisYear = new Date().getFullYear();
    if (!Number.isFinite(year) || year < thisYear - 120 || year > thisYear) return;
    await updatePersonBirthYear(birthYearTarget.id, year);
    await updatePersonHourglass(birthYearTarget.id, true);
    setPersons((prev) =>
      prev.map((p) =>
        p.id === birthYearTarget.id
          ? { ...p, birthYear: year, hourglassEnabled: true }
          : p,
      ),
    );
    setBirthYearTarget(null);
  }

  async function handleAddPerson(): Promise<void> {
    const name = newName.trim();
    if (!name) return;
    // Phải truyền desiredCadence: thiếu nó thì Đồng hồ cát tính visitsPerYear = 0
    // và card hiện "còn khoảng 0 lần gặp" — con số vừa sai vừa nặng nề.
    await createPerson({
      name,
      role: newRole,
      desiredCadence: DEFAULT_CADENCE[newRole],
    });
    setNewName('');
    setNewRole('friend');
    setAddPersonVisible(false);
    await reloadPersons();
  }

  async function handleExportJson(): Promise<void> {
    try {
      const [allPersons, allTimeEntries, allMoments] = await Promise.all([
        findAllPersons(),
        findAllTimeEntries(),
        findAllMoments(),
      ]);
      const payload = JSON.stringify(
        { exportedAt: new Date().toISOString(), persons: allPersons, timeEntries: allTimeEntries, moments: allMoments },
        null,
        2,
      );
      const file = new File(Paths.cache, `mira-export-${Date.now()}.json`);
      file.create({ overwrite: true });
      file.write(payload);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
      } else {
        Alert.alert(vi.settings.exportSuccess, file.uri);
      }
    } catch {
      Alert.alert(vi.common.error, vi.settings.exportFailed);
    }
  }

  function handleDeleteAll(): void {
    Alert.alert(vi.settings.deleteAll, vi.settings.deleteConfirm, [
      { text: vi.today.cancel, style: 'cancel' },
      {
        text: vi.settings.deleteButton,
        style: 'destructive',
        onPress: () => {
          void deleteAllLocalData().then(() => {
            setPersons([]);
            Alert.alert(vi.settings.deleteSuccess);
          });
        },
      },
    ]);
  }

  const curfewDisplay = `${String(curfewHour).padStart(2, '0')}:00`;
  const whiteDayDisplay =
    whiteDayOfWeek != null ? WEEKDAY_NAMES[whiteDayOfWeek] ?? vi.settings.whiteDayOff : vi.settings.whiteDayOff;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>{vi.settings.people}</Text>
        <View style={styles.section}>
          {persons.map((person) => (
            <PersonSettingRow
              key={person.id}
              person={person}
              onToggleHourglass={(enabled) => handleToggleHourglass(person, enabled)}
            />
          ))}
          <Button
            label={vi.settings.addPerson}
            onPress={() => setAddPersonVisible(true)}
            variant="ghost"
            style={styles.addButton}
          />
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.curfew}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setCurfewPickerVisible(true)}>
            <Text style={styles.rowLabel}>{vi.settings.curfew}</Text>
            <Text style={styles.rowValue}>{curfewDisplay}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>{vi.settings.curfewHint}</Text>
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.whiteDay}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setWhiteDayPickerVisible(true)}>
            <Text style={styles.rowLabel}>{vi.settings.whiteDay}</Text>
            <Text style={styles.rowValue}>{whiteDayDisplay}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>{vi.settings.whiteDayHint}</Text>
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.lifeCountdown}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{vi.settings.lifeCountdown}</Text>
            {/* Ràng buộc cứng #4: giá trị mặc định trong store là false, công tắc
                này chỉ phản chiếu lựa chọn của người dùng. */}
            <Switch
              value={lifeCountdownEnabled}
              onValueChange={setLifeCountdownEnabled}
              trackColor={{ true: colors.accent, false: colors.controlTrackOff }}
              thumbColor={colors.surface}
            />
          </View>
          <Text style={styles.hint}>{vi.settings.lifeCountdownHint}</Text>
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.data}</Text>
        <View style={styles.section}>
          <Button
            label={vi.settings.exportJson}
            onPress={() => void handleExportJson()}
            variant="secondary"
            style={styles.dataButton}
          />
          <Button
            label={vi.settings.deleteAll}
            onPress={handleDeleteAll}
            variant="ghost"
            style={[styles.dataButton, styles.deleteButton]}
          />
        </View>
      </ScrollView>

      {/* Hỏi năm sinh trước khi bật Đồng hồ cát — R-018 */}
      <Modal visible={birthYearTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.settings.birthYearPrompt}</Text>
            <Text style={styles.hint}>{vi.settings.birthYearHint}</Text>
            <TextInput
              style={styles.input}
              placeholder={vi.settings.birthYearPlaceholder}
              value={birthYearText}
              onChangeText={setBirthYearText}
              keyboardType="number-pad"
              maxLength={4}
            />
            <View style={styles.modalActions}>
              <Button
                label={vi.today.cancel}
                onPress={() => setBirthYearTarget(null)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleConfirmBirthYear()}
                disabled={!birthYearText}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Thêm người */}
      <Modal visible={addPersonVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.settings.addPerson}</Text>
            <TextInput
              style={styles.input}
              placeholder={vi.settings.addPersonNamePlaceholder}
              value={newName}
              onChangeText={setNewName}
            />
            <View style={styles.roleRow}>
              {ADD_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleChip, newRole === role && styles.roleChipSelected]}
                  onPress={() => setNewRole(role)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      newRole === role && styles.roleChipTextSelected,
                    ]}
                  >
                    {vi.settings.roles[role]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button
                label={vi.today.cancel}
                onPress={() => setAddPersonVisible(false)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleAddPerson()}
                disabled={!newName.trim()}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Giới nghiêm */}
      <Modal visible={curfewPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.settings.curfew}</Text>
            <View style={styles.roleRow}>
              {[19, 20, 21, 22, 23].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.roleChip, curfewHour === h && styles.roleChipSelected]}
                  onPress={() => {
                    setCurfewHour(h);
                    setCurfewPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      curfewHour === h && styles.roleChipTextSelected,
                    ]}
                  >
                    {String(h).padStart(2, '0')}:00
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              label={vi.today.cancel}
              onPress={() => setCurfewPickerVisible(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>

      {/* Ngày trắng */}
      <Modal visible={whiteDayPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.settings.whiteDay}</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleChip, whiteDayOfWeek === null && styles.roleChipSelected]}
                onPress={() => {
                  setWhiteDay(null);
                  setWhiteDayPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    whiteDayOfWeek === null && styles.roleChipTextSelected,
                  ]}
                >
                  {vi.settings.whiteDayOff}
                </Text>
              </TouchableOpacity>
              {WEEKDAY_NAMES.map((name, idx) => (
                <TouchableOpacity
                  key={name}
                  style={[styles.roleChip, whiteDayOfWeek === idx && styles.roleChipSelected]}
                  onPress={() => {
                    setWhiteDay(idx);
                    setWhiteDayPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      whiteDayOfWeek === idx && styles.roleChipTextSelected,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              label={vi.today.cancel}
              onPress={() => setWhiteDayPickerVisible(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  sectionTitle: {
    fontSize: fontSize.meta,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: fontSize.body, color: colors.textPrimary },
  rowValue: { fontSize: fontSize.body, color: colors.textSecondary },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 18,
  },
  addButton: { marginHorizontal: 16, marginVertical: 12 },
  dataButton: { marginHorizontal: 16, marginVertical: 6 },
  deleteButton: { marginBottom: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  modalSheet: { backgroundColor: colors.surface, borderRadius: 16, padding: 24 },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    marginBottom: 12,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipSelected: { borderColor: colors.accent, backgroundColor: colors.accentSurface },
  roleChipText: { fontSize: fontSize.small, color: colors.textLabel },
  roleChipTextSelected: { color: colors.accent, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalActionButton: { flex: 1 },
});

export default SettingsScreen;
