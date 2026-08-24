import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { vi } from '@/i18n/vi';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import type { OnboardingStackParamList, PersonRole } from '@/shared/types';
import { createPerson } from '@/db/repositories/personRepository';
import { useSettingsStore } from '@/store/settingsStore';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'Cadence'>;
type RouteType = RouteProp<OnboardingStackParamList, 'Cadence'>;

const DEFAULT_CADENCE: Record<PersonRole, number> = {
  child: 30,
  parent: 2,
  partner: 30,
  friend: 2,
  self: 30,
  other: 4,
};

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
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardContent: { flex: 1 },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  question: {
    fontSize: 13,
    color: '#6B7280',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
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
