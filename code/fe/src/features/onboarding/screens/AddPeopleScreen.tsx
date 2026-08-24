import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { vi } from '@/i18n/vi';
import Button from '@/shared/components/Button';
import type { OnboardingStackParamList, PersonRole } from '@/shared/types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'AddPeople'>;
type RouteType = RouteProp<OnboardingStackParamList, 'AddPeople'>;

const ROLE_LABELS: Record<PersonRole, string> = {
  child: vi.onboarding.roles.child,
  parent: vi.onboarding.roles.parent,
  partner: vi.onboarding.roles.partner,
  friend: vi.onboarding.roles.friend,
  self: vi.onboarding.roles.self,
  other: vi.settings.roles.other,
};

export function AddPeopleScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { roles } = route.params;

  const [names, setNames] = useState<Partial<Record<PersonRole, string>>>(
    Object.fromEntries(roles.map((r) => [r, ''])) as Partial<Record<PersonRole, string>>,
  );

  function handleNext(): void {
    const persons = roles
      .map((role) => {
        const name = names[role]?.trim() ?? '';
        return { name, role };
      })
      .filter((p) => p.name.length > 0);

    navigation.navigate('Cadence', { persons });
  }

  if (roles.length === 0) {
    navigation.navigate('Cadence', { persons: [] });
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{vi.onboarding.addNames}</Text>

          {roles.map((role) => (
            <View key={role} style={styles.inputGroup}>
              <Text style={styles.label}>{ROLE_LABELS[role]}</Text>
              <TextInput
                style={styles.input}
                placeholder={vi.onboarding.namePlaceholder(ROLE_LABELS[role])}
                value={names[role] ?? ''}
                onChangeText={(text) =>
                  setNames((prev) => ({ ...prev, [role]: text }))
                }
                autoCapitalize="words"
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
              label={vi.onboarding.next}
              onPress={handleNext}
              style={styles.footerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1A1A2E',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  footerButton: { flex: 1 },
});

export default AddPeopleScreen;
