import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../../theme';
import { FONTSIZE, MARGIN, PADDING } from '../../../theme/Constraints';
import { getSyncEngine } from '../Sync/SyncEngine';
import { SyncStatusLine } from '../Sync/SyncStatusLine';
import { syncText } from '../Sync/Text';
import { useSyncStatus } from '../Sync/useSyncStatus';
import { DEFAULT_SYNC_SETTINGS } from '../Sync/SyncSettingsStore';
// Sáu mục đầu của `05-v1-spec.md` §Settings do module Đồng hồ cát giữ, vì năm trong
// sáu mục là cấu hình của chính nó. Một dòng import duy nhất — xem
// `src/Hourglass/HANDOFF.md` mục "Nợ đã biết" cho hướng dọn.
import { HourglassApp } from '../../Hourglass';

export const SettingScreen = ({ navigation }: { readonly navigation: { readonly navigate: (route: string) => void } }) => {
  const colors = useTheme();
  const status = useSyncStatus();
  const [serverUrl, setServerUrl] = useState(DEFAULT_SYNC_SETTINGS.serverUrl);

  useEffect(() => {
    const stored = getSyncEngine().getSettings();
    if (stored) setServerUrl(stored.serverUrl);
  }, [status.enabled]);

  return (
    <ScrollView
      testID="setting-screen"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <HourglassApp.Screens.SettingsSections navigation={navigation} />

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        {syncText.sectionTitle}
      </Text>

      <View style={styles.row}>
        <View style={styles.rowLabel}>
          <Text style={[styles.label, { color: colors.onBackground }]}>
            {syncText.toggleLabel}
          </Text>
          <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
            {syncText.toggleHint}
          </Text>
        </View>
        <Switch
          value={status.enabled}
          onValueChange={(next) => getSyncEngine().updateSettings({ enabled: next })}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.onBackground }]}>
          {syncText.serverUrlLabel}
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.outlineVariant, color: colors.onBackground },
          ]}
          value={serverUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={syncText.serverUrlPlaceholder}
          placeholderTextColor={colors.onSurfaceVariant}
          onChangeText={setServerUrl}
          onBlur={() => getSyncEngine().updateSettings({ serverUrl })}
        />
      </View>

      <SyncStatusLine />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: PADDING.SCREEN,
  },
  sectionTitle: {
    fontSize: FONTSIZE.Title,
    marginBottom: MARGIN.GROUP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    flex: 1,
    paddingRight: PADDING.ELEMENT,
  },
  field: {
    marginTop: MARGIN.GROUP,
  },
  label: {
    fontSize: FONTSIZE.SMALL,
  },
  hint: {
    fontSize: FONTSIZE.SSMALL,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: FONTSIZE.SSMALL,
  },
});
