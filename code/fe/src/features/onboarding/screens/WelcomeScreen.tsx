import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vi } from '@/i18n/vi';
import Button from '@/shared/components/Button';
import { colors, fontSize } from '@/shared/theme/tokens';
import type { OnboardingStackParamList, PersonRole } from '@/shared/types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

const ROLE_OPTIONS: Array<{ role: PersonRole; label: string }> = [
  { role: 'child', label: vi.onboarding.roles.child },
  { role: 'parent', label: vi.onboarding.roles.parent },
  { role: 'partner', label: vi.onboarding.roles.partner },
  { role: 'friend', label: vi.onboarding.roles.friend },
  { role: 'self', label: vi.onboarding.roles.self },
];

export function WelcomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [selected, setSelected] = useState<PersonRole[]>([]);

  function toggleRole(role: PersonRole): void {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function handleNext(): void {
    if (selected.length === 0) return;
    navigation.navigate('AddPeople', { roles: selected });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{vi.onboarding.welcome}</Text>
        <Text style={styles.subtitle}>{vi.onboarding.welcomeSubtitle}</Text>

        <View style={styles.chips}>
          {ROLE_OPTIONS.map(({ role, label }) => {
            const isSelected = selected.includes(role);
            return (
              <TouchableOpacity
                key={role}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleRole(role)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label={vi.onboarding.next}
            onPress={handleNext}
            disabled={selected.length === 0}
            style={styles.nextButton}
          />
          <Button
            label={vi.onboarding.skip}
            onPress={() => navigation.navigate('AddPeople', { roles: [] })}
            variant="ghost"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  chipText: {
    fontSize: fontSize.bodyLarge,
    color: colors.textLabel,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 16,
    gap: 8,
  },
  nextButton: {},
});

export default WelcomeScreen;
