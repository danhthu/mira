/**
 * Ba trạng thái của một chỉ số. Lý do tồn tại: `00-vision.md` rủi ro #3 và các mục
 * "Biên" trong `03-formulas.md` đều cấm hiện con số trần khi dữ liệu chưa đủ.
 * Nếu hàm tính chỉ trả `number`, màn hình buộc phải tự đoán "0 nghĩa là chưa có
 * hay thật sự bằng 0" — đó là chỗ mọi app khác hiện 0đ/giờ cho người nội trợ.
 * Bọc kết quả vào union này thì trình biên dịch bắt UI phải xử lý cả ba nhánh.
 */

/** Vì sao không tính được. UI dịch mã này thành lời mời nhập, không thành lỗi. */
export type MetricEmptyReason =
  /** Chưa có bản ghi nào để tính. */
  | 'no_data'
  /** Mẫu số bằng 0 (chi phí sống thật = 0, giờ làm thật = 0). */
  | 'divide_by_zero'
  /** Chỉ số không áp dụng cho hoàn cảnh này — người không đi làm, không có tiết kiệm. */
  | 'not_applicable'
  /** Dữ liệu tự mâu thuẫn: tổng giờ đã ghi vượt quá quỹ giờ tỉnh. */
  | 'inconsistent';

export type MetricState<TValue> =
  | { readonly status: 'empty'; readonly reason: MetricEmptyReason }
  | {
      readonly status: 'learning';
      readonly value: TValue;
      /** Số mẫu đang có (ngày, hoặc tháng — tuỳ chỉ số). */
      readonly samplesHave: number;
      /** Số mẫu cần để chỉ số đáng tin. */
      readonly samplesNeed: number;
    }
  | { readonly status: 'ready'; readonly value: TValue };

export function emptyMetric<TValue>(reason: MetricEmptyReason): MetricState<TValue> {
  return { status: 'empty', reason };
}

export function readyMetric<TValue>(value: TValue): MetricState<TValue> {
  return { status: 'ready', value };
}

export function learningMetric<TValue>(
  value: TValue,
  samplesHave: number,
  samplesNeed: number,
): MetricState<TValue> {
  return { status: 'learning', value, samplesHave, samplesNeed };
}

/**
 * `ready` nếu đủ mẫu, `learning` nếu chưa. Gom vào một chỗ để không hàm nào tự
 * chế ngưỡng riêng — mọi ngưỡng đều nằm trong `constants.ts`.
 */
export function metricByCoverage<TValue>(
  value: TValue,
  samplesHave: number,
  samplesNeed: number,
): MetricState<TValue> {
  if (samplesHave >= samplesNeed) return readyMetric(value);
  return learningMetric(value, samplesHave, samplesNeed);
}

/** Có giá trị để hiện hay không. `learning` vẫn hiện được, kèm chú thích "đang tính". */
export function hasValue<TValue>(
  state: MetricState<TValue>,
): state is Exclude<MetricState<TValue>, { status: 'empty' }> {
  return state.status !== 'empty';
}

/**
 * Rút một phần của chỉ số mà giữ nguyên trạng thái. Dùng khi một hàm tính cả cụm
 * số rồi hàm khác chỉ cần một con — trạng thái "đang tính" phải đi theo, nếu không
 * UI sẽ tưởng con số lẻ đó đã đủ tin.
 */
export function mapMetric<TIn, TOut>(
  state: MetricState<TIn>,
  project: (value: TIn) => TOut,
): MetricState<TOut> {
  if (state.status === 'empty') return emptyMetric<TOut>(state.reason);
  if (state.status === 'learning') {
    return learningMetric(project(state.value), state.samplesHave, state.samplesNeed);
  }
  return readyMetric(project(state.value));
}
