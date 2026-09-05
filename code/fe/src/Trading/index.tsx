import moment from 'moment';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { BText as Text } from '../../libs/components';
import { useTheme } from '../../theme';
import { FONT_SIZE, FONT_WEIGHT } from '../../theme/Constraints';
import {
  formatDayLabel,
  recentDayCounts,
  shortestGapMinutes,
  timesOnDay,
} from './Models/stats';
import {
  DEFAULT_GAP_MINUTES,
  loadTradingData,
  saveTradingData,
} from './Models/storage';
import { useText } from './Text';

const RECENT_DAYS = 7;

/**
 * Nhịp xem giá.
 *
 * Bản Batify cũ ("Trading Time Tracker") chia lịch sử thành "các ngày đạt mục
 * tiêu" tô xanh lá và "các ngày không đạt mục tiêu" tô đỏ — màu đỏ báo người
 * dùng làm chưa đủ, đúng thứ ràng buộc cứng #3 cấm. Nó cũng lưu nhầm:
 * `saveData` đọc state cũ qua closure nên lần ghi nào cũng chậm một nhịp.
 *
 * Bản này chỉ đếm: hôm nay bao nhiêu lần, khoảng ngắn nhất giữa hai lần là bao
 * nhiêu phút, và bảy ngày gần đây mỗi ngày bao nhiêu lần. Người dùng tự so với
 * khoảng cách họ tự đặt.
 */
export const TradingScreen = () => {
  const text = useText();
  const colors = useTheme();
  const [viewTimes, setViewTimes] = useState([] as string[]);
  const [gapMinutes, setGapMinutes] = useState(DEFAULT_GAP_MINUTES);
  const [gapInput, setGapInput] = useState('');
  const [gapError, setGapError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTradingData().then((data) => {
      setViewTimes(data.viewTimes);
      setGapMinutes(data.gapMinutes);
      setGapInput(`${data.gapMinutes}`);
      setLoaded(true);
    });
  }, []);

  /** Chỉ ghi sau khi đã đọc xong, để lần lưu đầu không đè lịch sử bằng mảng rỗng. */
  const persist = (times: string[], minutes: number) => {
    setViewTimes(times);
    setGapMinutes(minutes);
    if (loaded) saveTradingData({ viewTimes: times, gapMinutes: minutes });
  };

  const onLogView = () =>
    persist([...viewTimes, new Date().toISOString()], gapMinutes);

  const onSaveGap = () => {
    const minutes = Number.parseInt(gapInput, 10);
    if (Number.isNaN(minutes) || minutes <= 0) {
      setGapError(true);
      return;
    }
    setGapError(false);
    persist(viewTimes, minutes);
  };

  const now = new Date();
  const today = timesOnDay(viewTimes, now);
  const shortest = shortestGapMinutes(today);
  const days = recentDayCounts(viewTimes, now, RECENT_DAYS);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.token.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: FONT_SIZE.PageTitle,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
            color: colors.token.textPrimary,
          }}
        >
          {text.screen_title}
        </Text>
        <Text
          style={{
            color: colors.token.textSecondary,
            fontSize: 13,
            marginTop: 4,
            marginBottom: 24,
          }}
        >
          {text.intro}
        </Text>

        <View
          style={{
            backgroundColor: colors.token.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.token.border,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
            {text.today_count}
          </Text>
          <Text
            style={{
              fontSize: 32,
              color: colors.token.textPrimary,
              fontWeight: FONT_WEIGHT.SEMIBOLD,
            }}
          >
            {today.length}{' '}
            <Text style={{ fontSize: 15, color: colors.token.textSecondary }}>
              {text.today_times}
            </Text>
          </Text>
          {shortest !== null && (
            <Text style={{ color: colors.token.textSecondary, fontSize: 13 }}>
              {text.shortest_gap}: {shortest} {text.unit_minute}
            </Text>
          )}
          {today.length === 0 && (
            <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
              {text.empty_today}
            </Text>
          )}
          {today.length > 0 && (
            <Text
              style={{
                color: colors.token.textSecondary,
                fontSize: 13,
                marginTop: 8,
              }}
            >
              {today.map((time) => moment(time).format('HH:mm')).join('  ·  ')}
            </Text>
          )}
          <TouchableOpacity
            onPress={onLogView}
            style={{
              marginTop: 16,
              backgroundColor: colors.token.accent,
              borderRadius: 999,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.token.textOnAccent }}>
              {text.log_view}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: colors.token.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.token.border,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
            {text.gap_label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{
                flex: 1,
                height: 44,
                borderBottomWidth: 1,
                borderBottomColor: colors.token.border,
                color: colors.token.textPrimary,
              }}
              value={gapInput}
              onChangeText={setGapInput}
              keyboardType="numeric"
              placeholder={text.gap_hint}
              placeholderTextColor={colors.token.textMuted}
            />
            <Text
              style={{ marginLeft: 8, color: colors.token.textSecondary }}
            >
              {text.gap_unit}
            </Text>
          </View>
          {gapError && (
            <Text
              style={{
                color: colors.token.textSecondary,
                fontSize: 13,
                marginTop: 6,
              }}
            >
              {text.gap_invalid}
            </Text>
          )}
          <TouchableOpacity onPress={onSaveGap} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.token.accent }}>{text.gap_save}</Text>
          </TouchableOpacity>
          <Text
            style={{
              color: colors.token.textMuted,
              fontSize: 13,
              marginTop: 8,
            }}
          >
            {gapMinutes} {text.gap_unit}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.token.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.token.border,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: colors.token.textMuted,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {text.recent_days}
          </Text>
          {days.length === 0 && (
            <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
              {text.empty_days}
            </Text>
          )}
          {days.map((entry) => (
            <View
              key={entry.day}
              style={{
                flexDirection: 'row',
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.token.surfaceMuted,
              }}
            >
              <Text style={{ flex: 1, color: colors.token.textPrimary }}>
                {formatDayLabel(entry.day)}
              </Text>
              <Text style={{ color: colors.token.textSecondary }}>
                {entry.count} {text.today_times}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
