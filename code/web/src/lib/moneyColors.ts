import type { MoneyFlowCell } from '@mira/contract';
import type { IconName } from '../ui/Icon';

/**
 * Màu của năm ô tiền, dùng chung cho vòng dòng tiền, catalog và từng dòng khoản.
 *
 * Trước đây bảng này được chép ba lần: trong `CashFlow`, trong `MoneyEntryRow`, và sẽ là
 * lần thứ ba trong catalog. "Một sự thật, ba chỗ ghi" đã cắn dự án này đủ nhiều lần rồi
 * — lần đổi màu đầu tiên sẽ đổi được hai chỗ và bỏ sót chỗ thứ ba, và không bài kiểm nào
 * bắt được vì màu không có đúng/sai.
 *
 * Bản ĐỂ VIẾT CHỮ (`-ink`) chứ không phải bản tươi: mấy con số trong catalog là chữ trên
 * nền trắng. Lát trên vòng dòng tiền thì dùng bản tươi — xem `CashFlow`, nơi thứ tự lát
 * còn là một ràng buộc tương phản mà `npm run check-colors` canh riêng.
 */
export const MONEY_CELL_COLOR: Record<MoneyFlowCell, string> = {
  netIncome: 'var(--family-ink)',
  monthlyExpense: 'var(--red)',
  wastedMoney: 'var(--waste-ink)',
  investment: 'var(--work-ink)',
  debtPayment: 'var(--navy)',
};

/**
 * Hình DỰ PHÒNG của từng ô tiền — dùng khi danh mục chưa chọn hình riêng.
 *
 * Trước đây bảng này nằm trong `MoneyCatalog.tsx` dưới tên `BIEU_TUONG`, và chỉ có đúng
 * một chỗ dùng. Giờ ba chỗ cần nó — catalog, dòng khoản, khay quản lý danh mục — nên nó
 * về đây đứng cạnh bảng màu. Đúng cái lỗi "một sự thật ba chỗ ghi" mà file này sinh ra để
 * chặn, nên đừng chép nó đi đâu nữa.
 */
export const MONEY_CELL_ICON: Record<MoneyFlowCell, IconName> = {
  netIncome: 'income',
  monthlyExpense: 'receipt',
  investment: 'chart',
  wastedMoney: 'bin',
  debtPayment: 'bank',
};
