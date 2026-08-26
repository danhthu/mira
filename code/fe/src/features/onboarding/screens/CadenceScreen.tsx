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
import { colors, fontSize } from '@/shared/theme/tokens';
import { DEFAULT_CADENCE } from '@/core/constants';
import type { OnboardingStackParamList } from '@/shared/types';
import { createPerson } from '@/db/repositories/personRepository';
import { useSettingsStore } from '@/store/settingsStore';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'Cadence'>;
type RouteType = RouteProp<OnboardingStackParamList, 'Cadence'>;

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

  function adjustCadence(name: string, delta: number): void {
    setCadences((prev) => ({
      ...prev,
      [name]: Math.max(1, (prev[name] ?? 1) + delta),
    }));
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
        {persons.map((p) => {
          const cadence = cadences[p.name] ?? DEFAULT_CADENCE[p.role];
          const label =
            cadence >= 28
              ? vi.onboarding.cadenceDaily
              : `${cadence} ${vi.onboarding.cadenceUnit}`;

          return (
            <View key={p.name} style={styles.card}>
              <Avatar name={p.name} size={44} />
              <View style={styles.cardContent}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text style={styles.question}>
                  {vi.onboarding.cadenceQuestion(p.name)}
                </Text>
              </View>
              <View style={styles.stepper}>
                <Button
                  label="−"
                  onPress={() => adjustCadence(p.name, -1)}
                  variant="ghost"
                  style={styles.stepBtn}
                />
                <Text style={styles.cadenceValue}>{label}</Text>
                <Button
                  label="+"
                  onPress={() => adjustCadence(p.name, 1)}
                  variant="ghost"
                  style={styles.stepBtn}
                />
              </View>
            </View>
          );
        })}

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardContent: { flex: 1 },
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cadenceValue: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 70,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  footerButton: { flex: 1 },
});

export default CadenceScreen;
