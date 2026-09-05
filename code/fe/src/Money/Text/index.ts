/**
 * Toàn bộ chữ của trụ Tài chính. Không chuỗi nào viết thẳng trong `.tsx`.
 *
 * Giọng theo `00-vision.md` §"Giọng": sentence case, không "nên/phải/hãy", không
 * dấu chấm than, không câu nào nói người dùng làm chưa đủ. Người ra 2 tháng vốn
 * tự do đọc màn này phải thấy quãng đường phía trước, không thấy lời chê.
 */

import { MetricEmptyReason } from '../../Core/dataState';
import { WealthTier } from '../../Core/money';
import {
  formatAmountShort,
  formatDays,
  formatHours,
  formatMonths,
  formatMonthsOfSaving,
  formatPercent,
} from '../Models/format';
import { readableMonth } from '../Models/month';

const tierName: Record<WealthTier, string> = {
  survival: 'Sống sót',
  safe: 'An toàn',
  flexible: 'Linh hoạt',
  free: 'Tự do',
};

/**
 * Lý do không tính được, nói bằng lời mời chứ không bằng lỗi. Mỗi chỉ số có cách
 * nói riêng vì cùng một mã (`divide_by_zero`) nghĩa khác nhau ở mỗi chỗ.
 */
const standingUnavailable: Record<MetricEmptyReason, string> = {
  no_data: 'nấc giàu hiện ra sau tháng đầu tiên được ghi',
  divide_by_zero: 'nấc giàu hiện khi có chi phí sống hằng tháng',
  not_applicable: 'nấc giàu chưa áp dụng cho tháng này',
  inconsistent: 'số liệu tháng này đang lệch nhau',
};

const evaporationUnavailable: Record<MetricEmptyReason, string> = {
  no_data: 'bốc hơi hiện ra khi có thu nhập của tháng',
  divide_by_zero: 'bốc hơi hiện ra khi có thu nhập của tháng',
  not_applicable: 'tháng này không có phần bốc hơi',
  inconsistent: 'số liệu tháng này đang lệch nhau',
};

const freedomDaysUnavailable: Record<MetricEmptyReason, string> = {
  no_data: 'ngày tự do hiện ra sau tháng đầu tiên được ghi',
  divide_by_zero: 'ngày tự do hiện khi có chi phí sống hằng tháng',
  not_applicable: 'tháng này chưa có phần tiết kiệm',
  inconsistent: 'số liệu tháng này đang lệch nhau',
};

const savingsRateUnavailable: Record<MetricEmptyReason, string> = {
  no_data: 'tỷ lệ tiết kiệm hiện ra khi có thu nhập của tháng',
  divide_by_zero: 'tỷ lệ tiết kiệm hiện ra khi có thu nhập của tháng',
  not_applicable: 'tỷ lệ tiết kiệm chưa áp dụng cho tháng này',
  inconsistent: 'số liệu tháng này đang lệch nhau',
};

export const moneyText = {
  screenTitle: 'Tài chính',
  entryTitle: 'Năm ô của tháng này',
  entryIntro: 'năm ô, mỗi tháng một lần, khoảng hai phút',
  entryPrefilled: 'số của tháng gần nhất đã điền sẵn, sửa chỗ nào thay đổi',
  entryMonth: (monthKey: string) => `Đang ghi cho ${readableMonth(monthKey)}`,
  save: 'Lưu',
  saved: 'Đã lưu',
  openEntry: 'Nhập năm ô',
  updateEntry: 'Cập nhật năm ô',
  currencyUnit: 'đ',

  fieldNetIncome: 'Thu nhập ròng mỗi tháng',
  fieldNetIncomeHint: 'sau thuế và bảo hiểm',
  fieldMonthlyExpense: 'Chi phí cố định mỗi tháng',
  fieldMonthlyExpenseHint: 'nhà, điện nước, ăn, học phí',
  fieldDebt: 'Trả nợ mỗi tháng',
  fieldDebtHint: 'gốc và lãi cộng lại, không cần tách từng khoản vay',
  fieldSavings: 'Tiết kiệm và đầu tư mỗi tháng',
  fieldSavingsHint: 'một dòng tổng, Mira không theo dõi danh mục',
  fieldNetWorth: 'Tài sản ròng hiện có',
  fieldNetWorthHint: 'tài sản thanh khoản trừ dư nợ còn lại',
  fieldNetWorthBelowZero: 'đang nợ nhiều hơn có',

  emptyLabel: 'năm ô mỗi tháng',
  emptyTitle: 'Chưa có tháng nào được ghi',
  emptyBody:
    'năm ô là đủ để biết mai nghỉ việc thì sống được bao lâu, và mỗi tháng tiền đi đâu mất',

  standingTitle: 'Bạn giàu',
  standingUnavailable: (reason: MetricEmptyReason) => standingUnavailable[reason],
  standingOnLadder: (tier: WealthTier, months: number) =>
    `Bạn đang ở ${tierName[tier]} (${formatMonths(months)})`,
  standingNextBySaving: (monthsOfSaving: number, next: WealthTier) =>
    `Còn ${formatMonthsOfSaving(monthsOfSaving)} tiết kiệm nữa để bước sang ${tierName[next]}`,
  standingNextByGap: (monthsGap: number, next: WealthTier) =>
    `Còn ${formatMonths(monthsGap)} vốn tự do nữa là tới ${tierName[next]}`,
  standingTopTier: 'Đây là nấc cuối của thang, phía trước không còn nấc nào',
  standingInDebt: (shortfall: number) =>
    `Còn ${formatAmountShort(shortfall)} nữa để tài sản ròng về vạch 0`,
  standingInDebtBySaving: (monthsOfSaving: number) =>
    `Ở mức tiết kiệm hiện tại, quãng đường đó là ${formatMonthsOfSaving(monthsOfSaving)} tiết kiệm`,
  standingInDebtNoSaving: 'quãng đường về vạch 0 hiện ra khi có phần tiết kiệm hằng tháng',

  evaporationTitle: 'Bốc hơi',
  evaporationUnavailable: (reason: MetricEmptyReason) => evaporationUnavailable[reason],
  evaporationAmount: (amount: number) => `Tháng này ${formatAmountShort(amount)} bốc hơi`,
  evaporationBody: 'bạn không nhớ nó đi đâu',
  evaporationInLife: (amount: number, hours: number, days: number) =>
    `${formatAmountShort(amount)} = ${formatHours(hours)} đời bạn = ${formatDays(days)} tự do`,
  evaporationInFreedomDays: (amount: number, days: number) =>
    `${formatAmountShort(amount)} = ${formatDays(days)} tự do`,
  evaporationBalanced: 'Tháng này thu và chi khớp nhau, không có phần bốc hơi',
  evaporationOverspent: (amount: number) =>
    `Tháng này chi vượt thu ${formatAmountShort(amount)}`,
  evaporationOverspentBody: 'phần chênh đó lấy từ tài sản ròng',

  savingsRateTitle: 'Tỷ lệ tiết kiệm',
  savingsRateValue: (ratio: number) => formatPercent(ratio),
  savingsRateUnavailable: (reason: MetricEmptyReason) => savingsRateUnavailable[reason],

  freedomDaysTitle: 'Ngày tự do mua thêm trong tháng',
  freedomDaysValue: (days: number) => formatDays(days),
  freedomDaysUnavailable: (reason: MetricEmptyReason) => freedomDaysUnavailable[reason],

  learningNote: (have: number, need: number) =>
    `con số đang hình thành, đã có ${have} trên ${need} tháng`,
  averagedIncomeNote: 'thu nhập tính theo trung bình các tháng đã ghi',
};

export type MoneyText = typeof moneyText;

export const useText = (): MoneyText => moneyText;
