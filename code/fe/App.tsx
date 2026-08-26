import React from 'react'
import './polyfills'

import { MainScreen } from './src/Main'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sentry from '@sentry/react-native'
import { LogBox, Platform, Text, UIManager, View } from 'react-native'
import { clean as app_clean } from './AppSetup/clean'
import { initialize as app_initialize } from './AppSetup/initialize'
import { sample as app_sample } from './AppSetup/sample'
import { useAsyncAction, useSettings } from './src/Common/Hooks'

if (typeof global !== 'undefined') {
  global.AsyncStorage = AsyncStorage
}

// Kích hoạt LayoutAnimation trên Android (bắt buộc)
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}
export const App = App2 //Sentry.wrap(App2);
/*
Sentry.init({
  dsn: 'https://c1b4335a27b852eebb9296fd2b953561@o4507444762771456.ingest.us.sentry.io/4507444816379904',
  debug: false,
  tracesSampleRate: 0.0,  // Adjust this value as needed
  _experiments: {
    profilesSampleRate: 0.0,  // Enable profiling
  },
  beforeSend(event) {
    // Kiểm tra nếu event là performance event
    if (event.type === 'transaction') {
      // Lấy thời gian thực hiện của transaction
      const duration = parseFloat(event.contexts.trace.op);
      // Nếu thời gian thực hiện dưới 500ms, không gửi event này
      if (duration < 0.5) {
        return null;
      }
    }
    return event;
  }

});
*/
Sentry.init({
  dsn:
    'https://844c6244861ad88bed702620c058708b@o4507438821015552.ingest.us.sentry.io/4507804381282304',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
})

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  "It looks like you might be using shared value's .value (.*)",
])

function App2() {
  //Sentry.useProfiler("App root")
  const [settings, setSettings] = useSettings()
  const install = useAsyncAction(
    async () => {
      if (!settings.is_first_init) {
        setSettings({ is_first_init: true })
      }
      return true
    },
    [],
    false,
  )

  const setup = useAsyncAction(
    async () => {
      await app_clean()
      await app_initialize()
      await app_sample()
      return true
    },
    [],
    false,
  )

  if (!install || !setup)
    return (
      <View>
        <Text>App initialize, please wait a minut...</Text>
      </View>
    )

  return (
    <ActionSheetProvider>
      <MainScreen></MainScreen>
    </ActionSheetProvider>
  )
}
