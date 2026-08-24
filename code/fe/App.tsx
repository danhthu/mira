import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RootNavigator from '@/navigation/RootNavigator';
import WelcomeScreen from '@/features/onboarding/screens/WelcomeScreen';
import AddPeopleScreen from '@/features/onboarding/screens/AddPeopleScreen';
import CadenceScreen from '@/features/onboarding/screens/CadenceScreen';
import { useDatabase } from '@/shared/hooks/useDatabase';
import { useSettingsStore } from '@/store/settingsStore';
import { countPersons } from '@/db/repositories/personRepository';
import { vi } from '@/i18n/vi';
import type { OnboardingStackParamList, RootStackParamList } from '@/shared/types';

const Root = createNativeStackNavigator<RootStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingNavigator() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name="Welcome" component={WelcomeScreen} />
      <Onboarding.Screen name="AddPeople" component={AddPeopleScreen} />
      <Onboarding.Screen name="Cadence" component={CadenceScreen} />
    </Onboarding.Navigator>
  );
}

export default function App() {
  const { isReady, error } = useDatabase();
  const { onboardingComplete, setOnboardingComplete } = useSettingsStore();
  const [checkingPersons, setCheckingPersons] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    // Web không có SQLite — skip DB check và vào thẳng main UI
    if (Platform.OS === 'web') {
      setOnboardingComplete(true);
      setCheckingPersons(false);
      return;
    }

    let cancelled = false;
    countPersons()
      .then((count) => {
        if (!cancelled && count > 0) {
          setOnboardingComplete(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingPersons(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, setOnboardingComplete]);

  if (!isReady || checkingPersons) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B5BDB" />
        <Text style={styles.loadingText}>{vi.common.loading}</Text>
      </View>
    );
  }

  if (error != null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{vi.common.error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {onboardingComplete ? (
          <Root.Screen name="Main" component={RootNavigator} />
        ) : (
          <Root.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
