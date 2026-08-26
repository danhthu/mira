/** Một phần của vòng donut, đo bằng độ, 0° ở vị trí 12 giờ, chiều kim đồng hồ. */
export interface DonutArc {
  color: string;
  startDeg: number;
  sweepDeg: number;
}

export interface DonutInput {
  value: number;
  color: string;
}

const FULL_TURN = 360;
const MAX_ARC = 180;

/**
 * Chia danh sách giá trị thành các cung vẽ được.
 *
 * Vì sao phải chẻ nhỏ: React Native không có API cắt cung tròn. Cách vẽ duy nhất
 * không cần thư viện đồ hoạ là che một nửa hình tròn rồi xoay một nửa đĩa bên
 * dưới — kỹ thuật đó chỉ đúng với cung tối đa 180°. Một khoản chiếm 3/4 vòng vì
 * thế phải thành nhiều cung nhỏ đặt nối đuôi nhau.
 *
 * Giá trị âm bị bỏ qua thay vì làm lệch cả vòng. Tổng bằng 0 trả về mảng rỗng —
 * người gọi tự quyết hiển thị gì, ở đây không đoán hộ.
 */
export function buildDonutArcs(segments: readonly DonutInput[]): DonutArc[] {
  const usable = segments.filter((segment) => segment.value > 0);
  const total = usable.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) {
    return [];
  }

  const arcs: DonutArc[] = [];
  let cursorDeg = 0;

  for (const segment of usable) {
    const sweepDeg = (segment.value / total) * FULL_TURN;
    const pieces = Math.ceil(sweepDeg / MAX_ARC);
    const pieceDeg = sweepDeg / pieces;

    for (let piece = 0; piece < pieces; piece += 1) {
      arcs.push({ color: segment.color, startDeg: cursorDeg, sweepDeg: pieceDeg });
      cursorDeg += pieceDeg;
    }
  }

  return arcs;
}
