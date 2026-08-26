import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  nearestStepIndex,
  ratioOfStepIndex,
  stepIndexAtRatio,
  type StepScale,
} from '@/core/stepScale';
import { colors, spacing } from '@/shared/theme/tokens';

interface StepSliderProps {
  steps: StepScale;
  value: number;
  onChange: (value: number) => void;
  /** Nhãn hiện dưới kim. Chuỗi phải đến từ i18n, không dựng chuỗi tại đây. */
  formatLabel: (value: number) => string;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const TRACK_HEIGHT = 4;
const KNOB_SIZE = 26;
const NOTCH_SIZE = 8;

/**
 * Thanh trượt theo nấc rời rạc, chạm hoặc kéo đều được.
 *
 * Dùng nấc chứ không dùng dải liên tục vì các con số ở đây có ý nghĩa rời: gặp
 * 2 hay 4 lần một tháng là hai ý định khác nhau, còn 17 với 18 thì không. Nấc
 * cũng giúp đi từ đầu này sang đầu kia trong một lần kéo, thay vì bấm cộng ba
 * mươi lần như cái stepper cũ.
 */
export function StepSlider({
  steps,
  value,
  onChange,
  formatLabel,
  accessibilityLabel,
  style,
}: StepSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = nearestStepIndex(steps, value);

  // PanResponder dựng một lần nên closure của nó giữ bản cũ của trackWidth và
  // onChange; ref là cách để cử chỉ luôn đọc giá trị mới nhất.
  const latest = useRef({ trackWidth, steps, onChange });
  latest.current = { trackWidth, steps, onChange };
  // Điểm chạm đầu, tính theo mép trái thanh. Quãng kéo sau đó cộng dồn từ đây
  // chứ không đọc toạ độ màn hình: hai hệ toạ độ đó lệch nhau đúng bằng lề
  // trái, đủ để kim nhảy một nấc ngay khi vừa chạm.
  const grantX = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          grantX.current = event.nativeEvent.locationX;
          selectAt(latest.current, grantX.current);
        },
        onPanResponderMove: (_event, gesture) => {
          selectAt(latest.current, grantX.current + gesture.dx);
        },
      }),
    [],
  );

  function handleLayout(event: LayoutChangeEvent): void {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  const knobRatio = ratioOfStepIndex(steps.length, selectedIndex);
  const knobLeft = knobRatio * trackWidth - KNOB_SIZE / 2;

  return (
    <View style={style}>
      <View
        style={styles.track}
        onLayout={handleLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: formatLabel(steps[selectedIndex]!) }}
        {...panResponder.panHandlers}
      >
        <View style={styles.rail} />
        <View style={[styles.railFilled, { width: knobRatio * trackWidth }]} />

        {steps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.notch,
              {
                left: ratioOfStepIndex(steps.length, index) * trackWidth - NOTCH_SIZE / 2,
              },
              index <= selectedIndex && styles.notchPassed,
            ]}
          />
        ))}

        {trackWidth > 0 && <View style={[styles.knob, { left: knobLeft }]} />}
      </View>

      <Text style={styles.label}>{formatLabel(steps[selectedIndex]!)}</Text>
    </View>
  );
}

function selectAt(
  current: { trackWidth: number; steps: StepScale; onChange: (value: number) => void },
  x: number,
): void {
  if (current.trackWidth === 0) {
    return;
  }
  const index = stepIndexAtRatio(current.steps.length, x / current.trackWidth);
  current.onChange(current.steps[index]!);
}

const styles = StyleSheet.create({
  track: {
    height: KNOB_SIZE,
    justifyContent: 'center',
    // Chạm hụt vào khoảng giữa hai nấc là chuyện thường trên màn hình hẹp, nên
    // vùng nhận chạm phải cao hơn sợi ray.
    marginHorizontal: KNOB_SIZE / 2,
  },
  rail: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.borderSubtle,
  },
  railFilled: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.accent,
  },
  notch: {
    position: 'absolute',
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    backgroundColor: colors.border,
  },
  notchPassed: {
    backgroundColor: colors.accent,
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  label: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default StepSlider;
