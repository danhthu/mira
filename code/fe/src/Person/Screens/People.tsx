import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import useScreenLoadTime from '../../../hook/useScreenLoadTime';
import { Person } from '../../Common/Entities/person';
import { TimeEntry } from '../../Common/Entities/timeEntry';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { personRepository, timeEntryRepository } from '../../Common/Repositories';
import { PersonCard } from '../Components/PersonCard';
import { PersonForm, PersonFormTarget } from '../Components/PersonForm';
import { usePersonStyle } from '../Components/styles';
import {
  daysBetween,
  entriesOfPerson,
  groupByRole,
  lastMetDate,
  weekCoverage,
  weeklyMinutesOf,
} from '../Models/people';
import { personCardView, roleName } from '../Models/presenter';
import {
  PersonDraft,
  addPerson,
  defaultCadenceFor,
  removePerson,
  updatePerson,
} from '../Models/store';
import { inRange, toIsoDate, weekRangeOf } from '../Models/week';
import { useText } from '../Text';

interface PeopleData {
  readonly people: readonly Person[];
  readonly entries: readonly TimeEntry[];
}

const EMPTY_DATA: PeopleData = { people: [], entries: [] };

const NEW_PERSON: PersonFormTarget = {
  id: null,
  draft: { name: '', role: 'other', desiredCadence: defaultCadenceFor('other') },
};

/**
 * Danh sách người quan trọng (`05-v1-spec.md` §"Màn hình 4"). Nhóm theo vai, không
 * xếp hạng ai trên ai, không chấm điểm quan hệ, không câu nhắc nào nói người dùng
 * làm chưa đủ (ràng buộc cứng #3).
 */
export const People = () => {
  useScreenLoadTime('People', []);
  const style = usePersonStyle();
  const text = useText();
  const nav = useNavigation();
  const [target, setTarget] = useState<PersonFormTarget | null>(null);

  const data = useAsyncAction<PeopleData>(
    async () => ({
      people: await personRepository.list(),
      entries: await timeEntryRepository.list(),
    }),
    [
      useDectectDataChanged(personRepository),
      useDectectDataChanged(timeEntryRepository),
    ],
    EMPTY_DATA,
  );

  const now = new Date();
  const today = toIsoDate(now);
  const week = weekRangeOf(now);
  const weekEntries = data.entries.filter((entry) => inRange(entry.date, week));
  const coverage = weekCoverage(weekEntries);

  const save = async (id: string | null, draft: PersonDraft) => {
    setTarget(null);
    if (id === null) {
      await addPerson(draft);
      return;
    }
    await updatePerson(id, draft);
  };

  const remove = async (id: string) => {
    setTarget(null);
    await removePerson(id);
  };

  return (
    <View style={style.screen}>
      <ScrollView contentContainerStyle={style.content}>
        <View style={style.header}>
          <Text style={style.headerTitle}>{text.title}</Text>
          <Pressable
            accessibilityRole="button"
            style={style.headerAction}
            onPress={() => nav.goBack()}
          >
            <Text style={style.headerActionText}>{text.done}</Text>
          </Pressable>
        </View>

        {data.people.length === 0 ? (
          <View>
            <Text style={style.emptyText}>{text.listEmpty}</Text>
            <Text style={style.emptyPath}>{text.listEmptyPath}</Text>
          </View>
        ) : null}

        {groupByRole(data.people).map((group) => (
          <View key={group.role}>
            <Text style={style.groupTitle}>{roleName(group.role, text)}</Text>
            {group.people.map((person) => {
              const mine = entriesOfPerson(data.entries, person.id);
              const lastMet = lastMetDate(mine);
              return (
                <PersonCard
                  key={person.id}
                  view={personCardView(
                    {
                      name: person.name,
                      weekMinutes: weeklyMinutesOf(
                        entriesOfPerson(weekEntries, person.id),
                        coverage,
                      ),
                      lastMet,
                      daysSinceLastMet:
                        lastMet === null ? null : daysBetween(lastMet, today),
                      desiredCadence: person.desiredCadence,
                    },
                    text,
                  )}
                  onEdit={() =>
                    setTarget({
                      id: person.id,
                      draft: {
                        name: person.name,
                        role: person.role,
                        desiredCadence:
                          person.desiredCadence === undefined
                            ? defaultCadenceFor(person.role)
                            : person.desiredCadence,
                      },
                    })
                  }
                />
              );
            })}
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          style={style.addButton}
          onPress={() => setTarget(NEW_PERSON)}
        >
          <Text style={style.addButtonText}>{text.add}</Text>
        </Pressable>
      </ScrollView>

      <PersonForm
        target={target}
        onSave={save}
        onRemove={remove}
        onCancel={() => setTarget(null)}
      />
    </View>
  );
};
