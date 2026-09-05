import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import useScreenLoadTime from '../../../hook/useScreenLoadTime';
import { Router } from '../../../Router';
import { Person } from '../../Common/Entities/person';
import { TimeEntry } from '../../Common/Entities/timeEntry';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import {
  moneyRepository,
  personRepository,
  timeEntryRepository,
} from '../../Common/Repositories';
import { sumMinutes } from '../../Core/time';
import { Board } from '../Components/Board';
import { MomentInput } from '../Components/MomentInput';
import { PeopleRow } from '../Components/PeopleRow';
import { QuickSheet } from '../Components/QuickSheet';
import { useHomeStyle } from '../Components/styles';
import { WasteRow } from '../Components/WasteRow';
import {
  MoneySnapshot,
  latestMoneyUpTo,
  moneyDashboard,
  timeDashboard,
} from '../Models/dashboard';
import { RUNNING_TICK_MS, WASTE_TAP_MINUTES } from '../Models/constants';
import { formatVietnameseDate } from '../Models/format';
import {
  RunningSession,
  addPerson,
  clearRunningSession,
  elapsedMinutes,
  loadRunningSession,
  logPeopleMinutes,
  logWasteMinutes,
  saveMoment,
  startRunningSession,
  stopRunningSession,
} from '../Models/logging';
import {
  evaporationMetricView,
  timeMetricView,
  wealthMetricView,
} from '../Models/presenter';
import {
  entriesInRange,
  previousWeekRangeOf,
  toMonthKey,
  weekRangeOf,
} from '../Models/week';
import { useText } from '../Text';

interface HomeData {
  readonly people: readonly Person[];
  readonly entries: readonly TimeEntry[];
  readonly money: readonly MoneySnapshot[];
}

const EMPTY_DATA: HomeData = { people: [], entries: [], money: [] };

/** Cái gì đang chờ chọn khoảng: một người, hay một nhãn lãng phí. */
type QuickTarget =
  | { readonly kind: 'person'; readonly person: Person }
  | { readonly kind: 'waste'; readonly label: string };

export const Home = () => {
  useScreenLoadTime('Home', []);
  const style = useHomeStyle();
  const text = useText();
  const nav = useNavigation();

  const [now, setNow] = useState(new Date());
  const [session, setSession] = useState<RunningSession | null>(null);
  const [quickTarget, setQuickTarget] = useState<QuickTarget | null>(null);

  const data = useAsyncAction<HomeData>(
    async () => ({
      people: await personRepository.list(),
      entries: await timeEntryRepository.list(),
      money: await moneyRepository.list(),
    }),
    [
      useDectectDataChanged(personRepository),
      useDectectDataChanged(timeEntryRepository),
      useDectectDataChanged(moneyRepository),
    ],
    EMPTY_DATA,
  );

  useEffect(() => {
    loadRunningSession().then(setSession);
  }, []);

  useEffect(() => {
    // Phiên trỏ vào người đã bị xoá thì không còn nút dừng nào trên màn hình —
    // bỏ phiên đi, nếu không số giờ đang đếm sẽ treo vĩnh viễn.
    if (session === null || data.people.length === 0) return;
    if (data.people.some((person) => person.id === session.personId)) return;
    clearRunningSession().then(() => setSession(null));
  }, [session, data.people]);

  useEffect(() => {
    // Chỉ chạy đồng hồ khi thật sự có phiên đang đếm.
    if (session === null) return undefined;
    const timer = setInterval(() => setNow(new Date()), RUNNING_TICK_MS);
    return () => clearInterval(timer);
  }, [session]);

  const thisWeek = entriesInRange(data.entries, weekRangeOf(now));
  const lastWeek = entriesInRange(data.entries, previousWeekRangeOf(now));
  const time = timeDashboard(thisWeek, lastWeek);
  const month = toMonthKey(now);
  const money = moneyDashboard(
    latestMoneyUpTo(data.money, month),
    month,
    sumMinutes(thisWeek, 'necessary'),
  );

  const startWith = async (person: Person) => {
    if (session !== null) await stopRunningSession(session, new Date());
    setSession(await startRunningSession(person.id, new Date()));
    setNow(new Date());
  };

  const stop = async () => {
    if (session === null) return;
    await stopRunningSession(session, new Date());
    setSession(null);
  };

  const pickQuick = async (minutes: number) => {
    const target = quickTarget;
    setQuickTarget(null);
    if (target === null) return;
    if (target.kind === 'person') {
      await logPeopleMinutes(target.person.id, minutes, new Date());
      return;
    }
    await logWasteMinutes(target.label, minutes, new Date());
  };

  const quickTitle =
    quickTarget === null || quickTarget.kind === 'waste'
      ? text.quickTitle
      : `${text.quickTitle} · ${quickTarget.person.name}`;

  return (
    <View style={style.screen}>
      <ScrollView contentContainerStyle={style.content}>
        <View style={style.header}>
          <Text style={style.headerDate}>{formatVietnameseDate(now)}</Text>
          <Pressable
            accessibilityRole="button"
            style={style.headerAction}
            onPress={() => Router.Open(nav, 'SettingApp', { screen: 'Setting' })}
          >
            <Text style={style.metricNote}>{text.settings}</Text>
          </Pressable>
        </View>

        <Board
          meaningful={timeMetricView(
            text.meaningfulLabel,
            text.meaningfulEmpty,
            time.meaningful,
            text,
          )}
          waste={timeMetricView(text.wasteLabel, text.wasteEmpty, time.waste, text)}
          wealth={wealthMetricView(money.standing, text)}
          evaporation={evaporationMetricView(money, text)}
        />

        <PeopleRow
          people={data.people}
          runningPersonId={session === null ? null : session.personId}
          runningMinutes={session === null ? 0 : elapsedMinutes(session, now)}
          onStart={startWith}
          onQuick={(person) => setQuickTarget({ kind: 'person', person })}
          onStop={stop}
          onAddPerson={(name) => {
            addPerson(name);
          }}
        />

        <WasteRow
          onTap={(label) => {
            logWasteMinutes(label, WASTE_TAP_MINUTES, new Date());
          }}
          onQuick={(label) => setQuickTarget({ kind: 'waste', label })}
        />

        <MomentInput
          onSave={(value) => {
            saveMoment(value, new Date());
          }}
        />
      </ScrollView>

      <QuickSheet
        visible={quickTarget !== null}
        title={quickTitle}
        onPick={pickQuick}
        onCancel={() => setQuickTarget(null)}
      />
    </View>
  );
};
