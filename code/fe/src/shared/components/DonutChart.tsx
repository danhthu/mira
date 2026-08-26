import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { buildDonutArcs, type DonutArc, type DonutInput } from '@/core/donutArcs';
import { colors } from '@/shared/theme/tokens';

export type DonutSegment = DonutInput & { label?: string };

interface DonutChartProps {
  segments: readonly DonutSegment[];
  size?: number;
  /** Bề dày vành. Phải nhỏ hơn nửa đường kính, nếu không lỗ giữa biến mất. */
  thickness?: number;
  /** Màu vành khi chưa có dữ liệu, và màu nền lộ ra ở lỗ giữa. */
  trackColor?: string;
  holeColor?: string;
  centerContent?: React.ReactNode;
}

/**
 * Biểu đồ vành khuyên vẽ bằng View thuần, không cần thư viện đồ hoạ.
 *
 * Mỗi cung là một nửa đĩa xoay quanh tâm, nhìn qua một khung chỉ để lộ nửa phải
 * của hình tròn. Giao của hai thứ đó ra đúng cung cần vẽ. Cung tối đa xử lý được
 * bằng cách này là 180°, nên `buildDonutArcs` đã chẻ sẵn phần lớn hơn.
 */
export function DonutChart({
  segments,
  size = 120,
  thickness = 18,
  trackColor = colors.borderSubtle,
  holeColor = colors.surface,
  centerContent,
}: DonutChartProps) {
  const arcs = useMemo(() => buildDonutArcs(segments), [segments]);
  const holeSize = size - thickness * 2;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View
        style={[
          styles.fill,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: trackColor },
        ]}
      />

      {arcs.map((arc, index) => (
        <Arc key={`${arc.color}-${index}`} arc={arc} size={size} />
      ))}

      <View
        style={[
          styles.hole,
          {
            width: holeSize,
            height: holeSize,
            borderRadius: holeSize / 2,
            backgroundColor: holeColor,
          },
        ]}
      >
        {centerContent}
      </View>
    </View>
  );
}

function Arc({ arc, size }: { arc: DonutArc; size: number }) {
  const half = size / 2;

  return (
    <View
      style={[styles.fill, { width: size, height: size, transform: [{ rotate: `${arc.startDeg}deg` }] }]}
    >
      <View style={[styles.window, { left: half, width: half, height: size }]}>
        <View
          style={[
            styles.fill,
            {
              left: -half,
              width: size,
              height: size,
              transform: [{ rotate: `${arc.sweepDeg - 180}deg` }],
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                left: half,
                width: half,
                height: size,
                borderTopRightRadius: half,
                borderBottomRightRadius: half,
                backgroundColor: arc.color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  window: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  hole: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DonutChart;
