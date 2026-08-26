import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HourglassCard from '../components/HourglassCard';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import {
  findPersonsWithHourglass,
  updatePersonHourglass,
} from '@/db/repositories/personRepository';
import { findEntriesByPersonId } from '@/db/repositories/timeEntryRepository';
import { calculateHourglass } from '@/core/hourglass';
import type { HourglassResult } from '@/core/hourglass';
import { todayYMD, dateMinusDays } from '@/shared/utils/date';
import { MINUTES_IN_HOUR } from '@/core/constants';
import type { Person } from '@/db/schema';
import type { MeStackParamList } from '@/shared/types';

// Chưa thu thập được ở đâu trong app — 05-v1-spec.md ví dụ card dùng 2 ngày mỗi
// lần, dùng lại làm giá trị mặc định cho tới khi có màn hình nhập riêng.
const DEFAULT_DAYS_PER_VISIT = 2;

interface PersonWithHourglass {
  person: Person;
  result: HourglassResult;
}

async function computeChildWeeklyHours(personId: string): Promise<number> {
  const since = dateMinusDays(todayYMD(), 6);
  const entries = await findEntriesByPersonId(personId);
  const minutes = entries
    .filter(
      (e) =>
        e.date >= since &&
        (e.bucket === 'people' || e.bucket === 'self'),
    )
    .reduce((sum, e) => sum + e.minutes, 0);
  return minutes / MINUTES_IN_HOUR;
}

async function computeResult(person: Person): Promise<HourglassResult | null> {
  if (person.birthYear == null) return null;
  const age = new Date().getFullYear() - person.birthYear;

  if (person.role === 'child') {
    const currentWeeklyHours = await computeChildWeeklyHours(person.id);
    return calculateHourglass({ type: 'child', currentAge: age, currentWeeklyHours });
  }

  return calculateHourglass({
    type: 'parent',
    currentAge: age,
    visitsPerYear: person.desiredCadence != null ? person.desiredCadence * 12 : 0,
    daysPerVisit: DEFAULT_DAYS_PER_VISIT,
  });
}

export function HourglassScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MeStackParamList>>();
  const [items, setItems] = useState<PersonWithHourglass[]>([]);
  const [missingBirthYearCount, setMissingBirthYearCount] = useState(0);

  const load = useCallback(async () => {
    const persons = await findPersonsWithHourglass();
    const withResults = await Promise.all(
      persons.map(async (person) => {
        const result = await computeResult(person);
        return result ? { person, result } : null;
      }),
    );
    setItems(withResults.filter((x): x is PersonWithHourglass => x !== null));
    // Người đã bật Đồng hồ cát nhưng thiếu năm sinh thì không tính được. Trước
    // đây họ bị lọc khỏi danh sách trong im lặng, người dùng thấy màn hình trống
    // mà không hiểu vì sao. Giữ lại số này để nói thẳng ra và chỉ chỗ nhập.
    setMissingBirthYearCount(
      persons.filter((p) => p.birthYear == null).length,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load().catch(() => {
      if (!cancelled) setItems([]);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleHideCard(personId: string): Promise<void> {
    // R-006: ẩn vĩnh viễn — tắt hourglassEnabled thật trong DB, không chỉ ẩn
    // trong state cục bộ. Người dùng bật lại từ Cài đặt nếu muốn xem lại.
    await updatePersonHourglass(personId, false);
    setItems((prev) => prev.filter((x) => x.person.id !== personId));
  }

  async function handleScheduleCall(): Promise<void> {
    const url = 'calshow://';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL('https://calendar.google.com/calendar/u/0/r/eventedit');
      }
    } catch {
      Alert.alert(vi.common.error, vi.settings.scheduleCallFailed);
    }
  }

  if (items.length === 0) {
    // Hai tình huống nhìn giống nhau nhưng cần nói khác nhau: chưa ai bật, và
    // đã bật rồi nhưng thiếu năm sinh nên không tính được.
    const isMissingData = missingBirthYearCount > 0;
    return (
      <SafeAreaView style={styles.safe}>
        <DataState
          message={
            isMissingData
              ? vi.hourglass.needsBirthYearTitle
              : vi.hourglass.emptyTitle
          }
          hint={
            isMissingData
              ? vi.hourglass.needsBirthYearHint(missingBirthYearCount)
              : vi.hourglass.emptyDescription
          }
          action={{
            label: isMissingData
              ? vi.hourglass.goToSettings
              : vi.hourglass.enableButton,
            onPress: () => navigation.navigate('Settings'),
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(x) => x.person.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HourglassCard
            person={item.person}
            result={item.result}
            onScheduleCall={() => void handleScheduleCall()}
            onHide={() => void handleHideCard(item.person.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
});

export default HourglassScreen;
