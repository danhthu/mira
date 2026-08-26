/** Thang giá trị rời rạc, phải tăng dần và có ít nhất một nấc. */
export type StepScale = readonly [number, ...number[]];

/**
 * Nấc gần `value` nhất.
 *
 * Cần đến vì dữ liệu cũ không nằm sẵn trên thang: một người đã lưu nhịp gặp 7
 * lần/tháng, thang mới không có nấc 7. Thả kim về nấc gần nhất giữ nguyên ý
 * người dùng, còn ép về nấc đầu thì âm thầm đổi dữ liệu của họ.
 *
 * Hoà nhau thì lấy nấc nhỏ hơn — giảm nhịp gặp là thay đổi người dùng dễ nhận
 * ra và sửa lại, tăng thì không.
 */
export function nearestStepIndex(steps: StepScale, value: number): number {
  let bestIndex = 0;
  let bestDistance = Math.abs(steps[0] - value);

  for (let index = 1; index < steps.length; index += 1) {
    const distance = Math.abs(steps[index]! - value);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  }

  return bestIndex;
}

/**
 * Chỉ số nấc ứng với một vị trí trên thanh trượt, `ratio` là 0 ở đầu trái và 1
 * ở đầu phải. Ngón tay kéo ra ngoài thanh vẫn ra nấc đầu hoặc nấc cuối.
 */
export function stepIndexAtRatio(stepCount: number, ratio: number): number {
  const lastIndex = stepCount - 1;
  const raw = Math.round(ratio * lastIndex);
  return Math.min(lastIndex, Math.max(0, raw));
}

/** Vị trí 0..1 của một nấc trên thanh, để vẽ kim. */
export function ratioOfStepIndex(stepCount: number, index: number): number {
  if (stepCount === 1) {
    return 0;
  }
  return index / (stepCount - 1);
}
