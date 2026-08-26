import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { vi } from '@/i18n/vi';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import StepSlider from '@/shared/components/StepSlider';
import { colors, fontSize } from '@/shared/theme/tokens';
import { CADENCE_STEPS, DAYS_IN_MONTH, DEFAULT_CADENCE } from '@/core/constants';
import type { OnboardingStackParamList } from '@/shared/types';
import { createPerson } from '@/db/repositories/personRepository';
import { useSettingsStore } from '@/store/settingsStore';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'Cadence'>;
type RouteType = RouteProp<OnboardingStackParamList, 'Cadence'>;

/** Nấc cuối của thang là mỗi ngày một lần, đọc "30 lần/tháng" thì không ai hiểu ngay. */
function formatCadence(times: number): string {
  return times >= DAYS_IN_MONTH ? vi.onboarding.cadenceDaily : vi.onboarding.cadenceLabel(times);
}

export function CadenceScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { persons } = route.params;
  const { setOnboardingComplete } = useSettingsStore();

  const [cadences, setCadences] = useState<Record<string, number>>(
    Object.fromEntries(
      persons.map((p) => [
        p.name,
        DEFAULT_CADENCE[p.role],
      ]),
    ),
  );
  const [isSaving, setIsSaving] = useState(false);

  function setCadence(name: string, value: number): void {
    setCadences((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDone(): Promise<void> {
    setIsSaving(true);
    try {
      for (const p of persons) {
        await createPerson({
          name: p.name,
          role: p.role,
          desiredCadence: cadences[p.name] ?? DEFAULT_CADENCE[p.role],
        });
      }
      setOnboardingComplete(true);
    } finally {
      setIsSaving(false);
    }
  }

  if (persons.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>{vi.onboarding.addNames}</Text>
          <Button
            label={vi.onboarding.done}
            onPress={() => {
              setOnboardingComplete(true);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {persons.map((p) => (
          <View key={p.name} style={styles.card}>
            <View style={styles.cardHeader}>
              <Avatar name={p.name} size={44} />
              <View style={styles.cardContent}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text style={styles.question}>{vi.onboarding.cadenceQuestion(p.name)}</Text>
              </View>
            </View>

            <StepSlider
              steps={CADENCE_STEPS}
              value={cadences[p.name] ?? DEFAULT_CADENCE[p.role]}
              onChange={(value) => setCadence(p.name, value)}
              formatLabel={formatCadence}
              accessibilityLabel={vi.onboarding.cadenceSliderLabel(p.name)}
              style={styles.slider}
            />
          </View>
        ))}

        <View style={styles.footer}>
          <Button
            label={vi.onboarding.back}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.footerButton}
          />
          <Button
            label={vi.onboarding.done}
            onPress={() => void handleDone()}
            loading={isSaving}
            style={styles.footerButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardContent: { flex: 1 },
  slider: { marginTop: 4 },
  personName: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  question: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  footerButton: { flex: 1 },
});

export default CadenceScreen;
