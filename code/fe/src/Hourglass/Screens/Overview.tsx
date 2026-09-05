/**
 * Màn hình 2 · Đồng hồ cát — `05-v1-spec.md`.
 *
 * Mặc định trống: chưa ai bật thì chỉ có một dòng giải thích và một nút bật. Ràng
 * buộc cứng #4 nằm trong `visibleCards`, màn này không có đường nào bật hộ ai.
 */

import { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { fontSize, space, useColorToken } from '../../../theme';
import { EnableSheet, EnableSheetValue } from '../Components/EnableSheet';
import { Button, Muted, Note, Sheet, Surface, Title } from '../Components/Basics';
import { ConfirmSheet } from '../Components/ConfirmSheet';
import { HourglassCardView } from '../Components/HourglassCardView';
import { useHourglass } from '../Hooks/useHourglass';
import { HourglassCard } from '../Models/cards';
import { PersonRow } from '../Models/people';
import { hourglassText } from '../Text';

const PersonPicker = ({
  people,
  onPick,
  onClose,
}: {
  readonly people: readonly PersonRow[];
  readonly onPick: (person: PersonRow) => void;
  readonly onClose: () => void;
}) => {
  const token = useColorToken();
  return (
    <Sheet visible onClose={onClose} testID="hourglass-person-picker">
      <Title>{hourglassText.pickTitle}</Title>
      <View style={{ marginTop: space.md }}>
        {people.map((person) => (
          <TouchableOpacity
            key={person.id}
            testID={'hourglass-pick-' + person.id}
            accessibilityRole="button"
            onPress={() => onPick(person)}
            style={{
              paddingVertical: space.md,
              borderBottomWidth: 1,
              borderBottomColor: token.border,
            }}
          >
            <Note>{person.name}</Note>
          </TouchableOpacity>
        ))}
        {people.length === 0 ? <Muted>{hourglassText.emptyNoPeople}</Muted> : null}
      </View>
      <View style={{ marginTop: space.lg }}>
        <Button
          testID="hourglass-picker-close"
          tone="quiet"
          label={hourglassText.cancel}
          onPress={onClose}
        />
      </View>
    </Sheet>
  );
};

export const Overview = () => {
  const token = useColorToken();
  const hourglass = useHourglass();
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<{
    readonly person: PersonRow;
    readonly mode: 'enable' | 'birth_year';
  } | null>(null);
  const [hiding, setHiding] = useState<HourglassCard | null>(null);

  const onAction = useCallback(
    (card: HourglassCard) => {
      if (card.action === 'enter_birth_year') {
        const person = hourglass.people.filter((row) => row.id === card.personId)[0];
        if (person) setEditing({ person, mode: 'birth_year' });
        return;
      }
      if (card.action === 'plan_contact') {
        hourglass.planContact(card.personId);
        return;
      }
      hourglass.postponeContact(card.personId);
    },
    [hourglass],
  );

  const onConfirmSheet = useCallback(
    (value: EnableSheetValue) => {
      if (!editing) return;
      const personId = editing.person.id;
      if (editing.mode === 'enable') {
        hourglass.enable(personId, value);
      } else {
        hourglass.saveBirthYear(personId, value.birthYear);
      }
      setEditing(null);
    },
    [editing, hourglass],
  );

  if (hourglass.loading) return null;

  const selectable = hourglass.people.filter((person) => !person.hourglassEnabled);

  return (
    <ScrollView
      testID="hourglass-screen"
      style={{ flex: 1, backgroundColor: token.background }}
      contentContainerStyle={{ padding: space.lg }}
    >
      <View style={{ marginBottom: space.lg }}>
        <Title>{hourglassText.screenTitle}</Title>
      </View>

      {hourglass.cards.length === 0 ? (
        <Surface testID="hourglass-empty">
          <Title>{hourglassText.emptyHeadline}</Title>
          <Note>{hourglassText.emptyExplain}</Note>
          <View style={{ marginTop: space.lg, alignItems: 'flex-start' }}>
            <Button
              testID="hourglass-enable-entry"
              tone="accent"
              label={hourglassText.emptyAction}
              onPress={() => setPicking(true)}
            />
          </View>
        </Surface>
      ) : (
        hourglass.cards.map((card) => (
          <HourglassCardView
            key={card.personId}
            card={card}
            onAction={onAction}
            onHide={setHiding}
          />
        ))
      )}

      {picking ? (
        <PersonPicker
          people={selectable}
          onClose={() => setPicking(false)}
          onPick={(person) => {
            setPicking(false);
            setEditing({ person, mode: 'enable' });
          }}
        />
      ) : null}

      {editing ? (
        <EnableSheet
          person={editing.person}
          mode={editing.mode}
          defaults={hourglass.draftFor(editing.person)}
          onConfirm={onConfirmSheet}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <ConfirmSheet
        testID="hourglass-hide-confirm"
        visible={hiding !== null}
        tone="destructive"
        title={hourglassText.hideConfirmTitle}
        body={hourglassText.hideConfirmBody}
        confirmLabel={hourglassText.hideConfirmYes}
        cancelLabel={hourglassText.hideConfirmNo}
        onConfirm={() => {
          if (hiding) hourglass.hideCard(hiding.personId);
          setHiding(null);
        }}
        onCancel={() => setHiding(null)}
      />

      <View style={{ height: fontSize.display }} />
    </ScrollView>
  );
};
