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
import { shouldSeedSampleData } from './AppSetup/sampleGate'
import { useAsyncAction, useSettings } from './src/Common/Hooks'
import { startSync } from './src/Common/Sync'

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
// Tắt cho V1: gửi 100% crash/performance trace ra ngoài, vi phạm ràng buộc cứng #5
// (local-first, không gửi gì lên server ở V1). Giữ lại code để bật lại khi có quyết định khác.
/*
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
*/

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
      // `app_initialize` chỉ điền chỗ còn trống nên chạy được mọi lần mở app.
      await app_initialize()
      // `app_clean` xoá sạch bảy module và `app_sample` ghi lại dữ liệu ngẫu nhiên.
      // Trước đây cả hai chạy vô điều kiện ngay tại đây, nên mọi thứ người dùng nhập
      // hôm nay biến mất khi mở app ngày mai. Giữ lại sau cổng của người phát triển
      // vì dựng lại kho mẫu vẫn là việc cần khi làm giao diện.
      if (shouldSeedSampleData()) {
        await app_clean()
        await app_sample()
      }
      // Sau khi kho cục bộ dựng xong. Không await lỗi mạng ở đây: `startSync` chỉ
      // cắm móc và hẹn vòng đầu, màn hình không chờ nó.
      await startSync()
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
