/**
 * Hỏi năm sinh lúc bật đồng hồ cát, kèm câu giải thích thẳng thắn nguyên văn
 * `05-v1-spec.md` §Onboarding. Câu đó luôn hiện, kể cả khi chỉ bổ sung năm sinh cho
 * card đã bật — người dùng có quyền đọc lại lý do trước khi đưa con số ra.
 */

import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { fontSize, radius, space, useColorToken } from '../../../theme';
import {
  EARLIEST_PLAUSIBLE_BIRTH_YEAR,
  usesChildHourglass,
} from '../../Core/hourglass';
import { PersonRow } from '../Models/people';
import { hourglassText } from '../Text';
import { Button, Muted, Note, Row, Sheet, Title } from './Basics';

export interface EnableSheetValue {
  readonly birthYear: number;
  readonly monthlyCadence: number;
  readonly daysPerVisit: number;
  readonly targetWeeklyHours: number;
}

export interface EnableSheetProps {
  readonly person: PersonRow | null;
  readonly defaults: Omit<EnableSheetValue, 'birthYear'>;
  /** `birth_year` chỉ hỏi năm sinh; `enable` hỏi cả nhịp gặp. */
  readonly mode: 'enable' | 'birth_year';
  readonly onConfirm: (value: EnableSheetValue) => void;
  readonly onCancel: () => void;
}

const NumberField = ({
  label,
  value,
  onChange,
  placeholder,
  testID,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly placeholder?: string;
  readonly testID: string;
}) => {
  const token = useColorToken();
  return (
    <View style={{ marginTop: space.md }}>
      <Text style={{ color: token.textSecondary, fontSize: fontSize.caption }}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        style={{
          marginTop: space.xs,
          borderWidth: 1,
          borderColor: token.border,
          borderRadius: radius.small,
          color: token.textPrimary,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          fontSize: fontSize.body,
        }}
        keyboardType="number-pad"
        value={value}
        placeholder={placeholder}
        placeholderTextColor={token.textMuted}
        onChangeText={onChange}
      />
    </View>
  );
};

export const EnableSheet = (props: EnableSheetProps) => {
  const { person, defaults, mode } = props;
  const [birthYear, setBirthYear] = useState('');
  const [cadence, setCadence] = useState('');
  const [daysPerVisit, setDaysPerVisit] = useState('');
  const [targetHours, setTargetHours] = useState('');

  useEffect(() => {
    setBirthYear(person && person.birthYear ? String(person.birthYear) : '');
    setCadence(String(defaults.monthlyCadence));
    setDaysPerVisit(String(defaults.daysPerVisit));
    setTargetHours(String(defaults.targetWeeklyHours));
  }, [person, defaults.monthlyCadence, defaults.daysPerVisit, defaults.targetWeeklyHours]);

  if (!person) return null;

  const currentYear = new Date().getFullYear();
  const parsedYear = Number(birthYear);
  const yearValid =
    birthYear.length > 0 &&
    Number.isInteger(parsedYear) &&
    parsedYear >= EARLIEST_PLAUSIBLE_BIRTH_YEAR &&
    parsedYear <= currentYear;

  const isChild = usesChildHourglass(person.role);

  const confirm = () =>
    props.onConfirm({
      birthYear: parsedYear,
      monthlyCadence: Number(cadence) || defaults.monthlyCadence,
      daysPerVisit: Number(daysPerVisit) || defaults.daysPerVisit,
      targetWeeklyHours: Number(targetHours) || defaults.targetWeeklyHours,
    });

  return (
    <Sheet visible onClose={props.onCancel} testID="hourglass-enable-sheet">
      <Title>{person.name}</Title>
      <Note>{hourglassText.enableExplain}</Note>

      <NumberField
        testID="hourglass-birth-year"
        label={hourglassText.birthYearLabel}
        placeholder={hourglassText.birthYearPlaceholder}
        value={birthYear}
        onChange={setBirthYear}
      />
      {birthYear.length > 0 && !yearValid ? (
        <Muted>{hourglassText.birthYearInvalid}</Muted>
      ) : null}

      {mode === 'enable' ? (
        <View>
          <NumberField
            testID="hourglass-cadence"
            label={hourglassText.cadenceLabel}
            value={cadence}
            onChange={setCadence}
          />
          {isChild ? (
            <NumberField
              testID="hourglass-target-hours"
              label={hourglassText.targetHoursLabel}
              value={targetHours}
              onChange={setTargetHours}
            />
          ) : (
            <NumberField
              testID="hourglass-days-per-visit"
              label={hourglassText.daysPerVisitLabel}
              value={daysPerVisit}
              onChange={setDaysPerVisit}
            />
          )}
        </View>
      ) : null}

      <View style={{ marginTop: space.lg }}>
        <Row>
          <Button
            testID="hourglass-enable-confirm"
            tone="accent"
            disabled={!yearValid}
            label={
              mode === 'enable'
                ? hourglassText.confirmEnable
                : hourglassText.saveBirthYear
            }
            onPress={confirm}
          />
          <Button
            testID="hourglass-enable-cancel"
            tone="quiet"
            label={hourglassText.cancel}
            onPress={props.onCancel}
          />
        </Row>
      </View>
    </Sheet>
  );
};
