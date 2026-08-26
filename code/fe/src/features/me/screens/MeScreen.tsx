import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vi } from '@/i18n/vi';
import { useSeasonRhythm } from '@/shared/hooks/useSeasonRhythm';
import { colors, fontSize } from '@/shared/theme/tokens';
import type { MeStackParamList } from '@/shared/types';

type MeRoute = Exclude<keyof MeStackParamList, 'MeHome'>;

interface MenuItem {
  route: MeRoute;
  label: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

/**
 * Màn Tôi là menu, không phải bảng chỉ số: R-025 cấm dashboard, biểu đồ, phần
 * trăm. Ở đây chỉ có tên module và đường dẫn tới nó — không con số tổng hợp,
 * không tiến độ, không thành tích.
 */
const SECTIONS: MenuSection[] = [
  {
    title: vi.me.sectionTime,
    items: [{ route: 'Hourglass', label: vi.nav.hourglass }],
  },
  {
    title: vi.me.sectionBody,
    items: [
      { route: 'Mood', label: vi.mood.title },
      { route: 'Health', label: vi.health.title },
    ],
  },
  {
    title: vi.me.sectionPeople,
    items: [
      { route: 'Connect', label: vi.connect.title },
      { route: 'Space', label: vi.space.title },
    ],
  },
  {
    title: vi.me.sectionKeep,
    items: [
      { route: 'Legacy', label: vi.legacy.title },
      { route: 'Learning', label: vi.learning.title },
      { route: 'Items', label: vi.items.title },
    ],
  },
  {
    title: vi.me.sectionSettings,
    items: [{ route: 'Settings', label: vi.nav.settings }],
  },
];

export function MeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MeStackParamList>>();
  const season = useSeasonRhythm();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.section}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.row, index > 0 && styles.rowDivided]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <Text style={styles.rowLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Nhịp mùa (M12): một dòng, không phải mục menu — R-025 cấm dashboard. */}
        <Text
          style={styles.seasonLine}
          accessibilityLabel={vi.slow.seasonTitle}
        >
          {vi.slow.seasonLine(season.title, season.outdoorPrompt)}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  sectionTitle: {
    fontSize: fontSize.meta,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  rowLabel: { fontSize: fontSize.body, color: colors.textPrimary },
  seasonLine: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});

export default MeScreen;
