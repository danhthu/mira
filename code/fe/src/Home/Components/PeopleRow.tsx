import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Person } from '../../Common/Entities/person';
import { MAX_PEOPLE_SHOWN } from '../Models/constants';
import { formatMinutes } from '../Models/format';
import { useText } from '../Text';
import { useHomeStyle } from './styles';

function initialOf(name: string): string {
  const trimmed = name.trim();
  return trimmed.length === 0 ? '' : trimmed.charAt(0).toUpperCase();
}

/**
 * Ghi giờ ý nghĩa một chạm (`05-v1-spec.md` DoD #2). Chạm avatar là bắt đầu đếm,
 * chạm lần nữa vào "dừng và ghi" là xong — hai chạm. Giữ avatar rồi chọn khoảng
 * là ghi nhanh — cũng hai thao tác, không ai phải qua ba màn hình.
 */
export const PeopleRow = (props: {
  people: readonly Person[];
  runningPersonId: string | null;
  runningMinutes: number;
  onStart: (person: Person) => void;
  onQuick: (person: Person) => void;
  onStop: () => void;
  onAddPerson: (name: string) => void;
}) => {
  const style = useHomeStyle();
  const text = useText();
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');

  const running = props.people.filter((p) => p.id === props.runningPersonId)[0];

  const submitName = () => {
    const name = draftName.trim();
    if (name.length === 0) return;
    props.onAddPerson(name);
    setDraftName('');
    setAdding(false);
  };

  return (
    <View style={style.section}>
      <Text style={style.sectionTitle}>{text.peopleTitle}</Text>
      <Text style={style.sectionHint}>{text.peopleHint}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style.personRow}>
        {props.people.slice(0, MAX_PEOPLE_SHOWN).map((person) => {
          const isRunning = person.id === props.runningPersonId;
          return (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityLabel={person.name}
              style={style.person}
              onPress={() => (isRunning ? props.onStop() : props.onStart(person))}
              onLongPress={() => props.onQuick(person)}
            >
              <View
                style={
                  isRunning
                    ? [style.personCircle, style.personCircleRunning]
                    : style.personCircle
                }
              >
                <Text
                  style={
                    isRunning
                      ? [style.personInitial, style.personInitialRunning]
                      : style.personInitial
                  }
                >
                  {initialOf(person.name)}
                </Text>
              </View>
              <Text numberOfLines={1} style={style.personName}>
                {person.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text.peopleAdd}
          style={style.person}
          onPress={() => setAdding(true)}
        >
          <View style={style.personAddCircle}>
            <Text style={style.personInitial}>+</Text>
          </View>
          <Text numberOfLines={1} style={style.personName}>
            {text.peopleAdd}
          </Text>
        </Pressable>
      </ScrollView>

      {props.people.length === 0 && !adding ? (
        <Text style={style.hintText}>{text.peopleEmpty}</Text>
      ) : null}

      {adding ? (
        <View style={style.inputRow}>
          <TextInput
            style={style.input}
            value={draftName}
            autoFocus
            placeholder={text.peopleAddPlaceholder}
            onChangeText={setDraftName}
            onSubmitEditing={submitName}
            returnKeyType="done"
          />
          <Pressable accessibilityRole="button" style={style.inputAction} onPress={submitName}>
            <Text style={style.inputActionText}>{text.peopleAddSave}</Text>
          </Pressable>
        </View>
      ) : null}

      {running ? (
        <View style={style.running}>
          <Text style={style.runningText}>
            {`${text.peopleRunningPrefix} ${running.name} · ${formatMinutes(props.runningMinutes)} ${text.minuteUnit}`}
          </Text>
          <Pressable accessibilityRole="button" onPress={props.onStop}>
            <Text style={style.runningStop}>{text.peopleStop}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
