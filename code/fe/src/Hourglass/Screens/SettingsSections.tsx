/**
 * Sáu mục đầu của `05-v1-spec.md` §"Màn hình 4 · Settings". Mục thứ bảy (Đồng bộ)
 * đã có sẵn trong `Common/Screens/SettingScreen.tsx` và không bị đụng tới.
 *
 * Cả cụm nằm trong module Đồng hồ cát vì năm trong sáu mục là cấu hình do module
 * này giữ; xem HANDOFF.md mục "Quyết định đã chốt" cho lý do và bước dọn về sau.
 */

import { useCallback, useState } from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';
import { radius, space, useColorToken } from '../../../theme';
import { Button, Muted, Note, Surface, Title } from '../Components/Basics';
import { ConfirmSheet } from '../Components/ConfirmSheet';
import { EnableSheet, EnableSheetValue } from '../Components/EnableSheet';
import { useHourglass } from '../Hooks/useHourglass';
import { useQuietTime } from '../Hooks/useQuietTime';
import { HOUR_CHOICES, WEEKDAY_NAMES, readableHour } from '../Models/calendar';
import { exportAllData } from '../Models/dataExport';
import { wipeAllData } from '../Models/dataWipe';
import { PersonRow } from '../Models/people';
import { settingText } from '../Text';

/** Route của module Người quan trọng và của màn Đồng hồ cát. */
export const PERSON_ROUTE = 'PersonApp';
export const HOURGLASS_ROUTE = 'Hourglass';

interface Navigator {
  readonly navigate: (route: string) => void;
}

const Chip = ({
  label,
  selected,
  onPress,
  testID,
}: {
  readonly label: string;
  readonly selected: boolean;
  readonly onPress: () => void;
  readonly testID: string;
}) => {
  const token = useColorToken();
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? token.accent : token.border,
        backgroundColor: selected ? token.accentSurface : token.surface,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        marginRight: space.sm,
        marginTop: space.sm,
      }}
    >
      <Muted>{label}</Muted>
    </TouchableOpacity>
  );
};

const LinkRow = ({
  label,
  hint,
  onPress,
  testID,
}: {
  readonly label: string;
  readonly hint: string;
  readonly onPress: () => void;
  readonly testID: string;
}) => {
  const token = useColorToken();
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingVertical: space.md,
        borderTopWidth: 1,
        borderTopColor: token.border,
      }}
    >
      <Note>{label}</Note>
      <Muted>{hint}</Muted>
    </TouchableOpacity>
  );
};

const PeopleSection = ({ navigation }: { readonly navigation: Navigator }) => {
  const hourglass = useHourglass();
  const [enabling, setEnabling] = useState<PersonRow | null>(null);

  const onToggle = useCallback(
    (person: PersonRow, next: boolean) => {
      if (next) {
        setEnabling(person);
        return;
      }
      hourglass.disable(person.id);
    },
    [hourglass],
  );

  const onConfirm = useCallback(
    (value: EnableSheetValue) => {
      if (!enabling) return;
      hourglass.enable(enabling.id, value);
      setEnabling(null);
    },
    [enabling, hourglass],
  );

  return (
    <View>
      <Surface testID="setting-people">
        <Title>{settingText.peopleTitle}</Title>
        <LinkRow
          testID="setting-person-list"
          label={settingText.peopleRow}
          hint={settingText.peopleHint}
          onPress={() => navigation.navigate(PERSON_ROUTE)}
        />
      </Surface>

      <Surface testID="setting-hourglass">
        <Title>{settingText.hourglassTitle}</Title>
        <Muted>{settingText.hourglassHint}</Muted>
        {hourglass.people.length === 0 ? (
          <Note>{settingText.hourglassEmpty}</Note>
        ) : (
          hourglass.people.map((person) => (
            <View
              key={person.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: space.md,
              }}
            >
              <View style={{ flex: 1, paddingRight: space.md }}>
                <Note>{person.name}</Note>
                {person.birthYear ? null : (
                  <Muted>{settingText.hourglassNeedsBirthYear}</Muted>
                )}
              </View>
              <Switch
                testID={'setting-hourglass-switch-' + person.id}
                value={person.hourglassEnabled}
                onValueChange={(next) => onToggle(person, next)}
              />
            </View>
          ))
        )}
        <LinkRow
          testID="setting-open-hourglass"
          label={settingText.hourglassOpen}
          hint={settingText.hourglassHint}
          onPress={() => navigation.navigate(HOURGLASS_ROUTE)}
        />
      </Surface>

      {enabling ? (
        <EnableSheet
          person={enabling}
          mode="enable"
          defaults={hourglass.draftFor(enabling)}
          onConfirm={onConfirm}
          onCancel={() => setEnabling(null)}
        />
      ) : null}
    </View>
  );
};

const QuietTimeSection = () => {
  const quiet = useQuietTime();
  return (
    <View>
      <Surface testID="setting-curfew">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: space.md }}>
            <Title>{settingText.curfewTitle}</Title>
            <Muted>{settingText.curfewHint}</Muted>
          </View>
          <Switch
            testID="setting-curfew-switch"
            value={quiet.settings.curfewEnabled}
            onValueChange={(next) => quiet.update({ curfewEnabled: next })}
          />
        </View>
        {quiet.settings.curfewEnabled ? (
          <View>
            <Note>{settingText.curfewHour(quiet.settings.curfewHour)}</Note>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {HOUR_CHOICES.map((hour) => (
                <Chip
                  key={hour}
                  testID={'setting-curfew-hour-' + hour}
                  label={readableHour(hour)}
                  selected={quiet.settings.curfewHour === hour}
                  onPress={() => quiet.update({ curfewHour: hour })}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Surface>

      <Surface testID="setting-white-day">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: space.md }}>
            <Title>{settingText.whiteDayTitle}</Title>
            <Muted>{settingText.whiteDayHint}</Muted>
          </View>
          <Switch
            testID="setting-white-day-switch"
            value={quiet.settings.whiteDayEnabled}
            onValueChange={(next) => quiet.update({ whiteDayEnabled: next })}
          />
        </View>
        {quiet.settings.whiteDayEnabled ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {WEEKDAY_NAMES.map((name, index) => (
              <Chip
                key={name}
                testID={'setting-white-day-' + index}
                label={name}
                selected={quiet.settings.whiteDayWeekday === index}
                onPress={() => quiet.update({ whiteDayWeekday: index })}
              />
            ))}
          </View>
        ) : null}
      </Surface>
    </View>
  );
};

const DataSection = () => {
  const [exportLine, setExportLine] = useState('');
  const [wipeLine, setWipeLine] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [busy, setBusy] = useState(false);

  const runExport = useCallback(() => {
    setBusy(true);
    setExportLine(settingText.exportRunning);
    exportAllData(new Date()).then((result) => {
      setExportLine(settingText.exportDone(result.storeCount, result.location));
      setBusy(false);
    });
  }, []);

  const runWipe = useCallback(() => {
    setConfirmWipe(false);
    setBusy(true);
    setWipeLine(settingText.wipeRunning);
    wipeAllData().then((report) => {
      setWipeLine(settingText.wipeDone(report.repositoriesEmptied, report.keysRemoved));
      setBusy(false);
    });
  }, []);

  return (
    <View>
      <Surface testID="setting-export">
        <Title>{settingText.exportTitle}</Title>
        <Muted>{settingText.exportHint}</Muted>
        <View style={{ marginTop: space.md, alignItems: 'flex-start' }}>
          <Button
            testID="setting-export-action"
            tone="accent"
            disabled={busy}
            label={settingText.exportAction}
            onPress={runExport}
          />
        </View>
        {exportLine ? <Note>{exportLine}</Note> : null}
      </Surface>

      <Surface testID="setting-wipe">
        <Title>{settingText.wipeTitle}</Title>
        <Muted>{settingText.wipeHint}</Muted>
        <View style={{ marginTop: space.md, alignItems: 'flex-start' }}>
          <Button
            testID="setting-wipe-action"
            tone="destructive"
            disabled={busy}
            label={settingText.wipeAction}
            onPress={() => setConfirmWipe(true)}
          />
        </View>
        {wipeLine ? <Note>{wipeLine}</Note> : null}
      </Surface>

      <ConfirmSheet
        testID="setting-wipe-confirm"
        visible={confirmWipe}
        tone="destructive"
        title={settingText.wipeConfirmTitle}
        body={settingText.wipeConfirmBody}
        confirmLabel={settingText.wipeConfirmYes}
        cancelLabel={settingText.wipeConfirmNo}
        onConfirm={runWipe}
        onCancel={() => setConfirmWipe(false)}
      />
    </View>
  );
};

/** Sáu mục, xếp đúng thứ tự của `05-v1-spec.md`. */
export const SettingsSections = ({
  navigation,
}: {
  readonly navigation: Navigator;
}) => (
  <View testID="setting-sections">
    <PeopleSection navigation={navigation} />
    <QuietTimeSection />
    <DataSection />
  </View>
);
