/**
 * Canh file luật `parse-rules.json`.
 *
 * Từ vựng tách ra file JSON để người và agent sửa được mà không phải đụng mã nguồn. Đổi
 * lại, trình biên dịch không còn canh giúp: gõ "thể dục" có dấu vào đó thì **không có lỗi
 * nào cả** — chỉ là từ khoá ấy không bao giờ khớp, im lặng, và câu của người dùng rơi
 * xuống lưới đoán. Đúng loại hỏng tệ nhất: không ai biết cho tới khi xem lại sổ.
 *
 * Mấy bài kiểm ở đây thay chỗ trình biên dịch.
 */
import { describe, it, expect } from 'vitest';
import luat from '../parse-rules.json';
import type { TimeBucket } from '../../shared/types/enums';

/**
 * Bốn ô, gõ tay ở đây một cách CỐ Ý.
 *
 * `TimeBucket` chỉ là union kiểu, lúc chạy không còn gì để so. Gõ lại thành mảng thì khi
 * ai đó thêm ô thứ năm vào union, dòng `satisfies` dưới đây bắt lỗi ngay — chứ không im
 * lặng để file luật trỏ vào một ô không tồn tại.
 */
const TIME_BUCKETS = ['work', 'family', 'personal', 'waste'] as const satisfies readonly TimeBucket[];

const VALID_MONEY_CELLS = [
  'netIncome',
  'monthlyExpense',
  'investment',
  'wastedMoney',
  'debtPayment',
  'debtBalance',
  'netWorth',
];

/** Mọi danh sách từ khoá trong file, kèm đường dẫn để báo lỗi chỉ đúng chỗ. */
const eachInList: ReadonlyArray<readonly [string, readonly string[]]> = [
  ...luat.bucketKeywords.map((n, i) => [`bucketKeywords[${i}] (${n.bucket})`, n.words] as const),
  ...luat.moneyKeywords.map((n, i) => [`moneyKeywords[${i}] (${n.cell})`, n.words] as const),
  ['cashWithdrawal', luat.cashWithdrawal.words] as const,
  ['camXuc.happy', luat.mood.happy] as const,
  ['camXuc.sad', luat.mood.sad] as const,
  ...luat.notRecorded.map((n, i) => [`khongGhi[${i}]`, n.words] as const),
];

describe('parse-rules.json — hình thức từ khoá', () => {
  it('⚑ MỌI từ khoá phải viết thường và KHÔNG DẤU', () => {
    // Câu người dùng được bỏ dấu trước khi so khớp. Từ khoá có dấu thì không bao giờ
    // khớp được với bất cứ gì — một dòng chết nằm im trong file.
    const hong: string[] = [];
    for (const [ten, ds] of eachInList) {
      for (const tu of ds) {
        const sach = tu
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/đ/g, 'd');
        if (tu !== sach) hong.push(`${ten}: "${tu}" → phải viết "${sach}"`);
      }
    }
    expect(hong).toEqual([]);
  });

  it('⚑ không có từ khoá rỗng hay thừa khoảng trắng', () => {
    const hong: string[] = [];
    for (const [ten, ds] of eachInList) {
      for (const tu of ds) {
        if (tu.trim() === '') hong.push(`${ten}: có từ rỗng`);
        else if (tu !== tu.trim() || /\s{2,}/.test(tu)) hong.push(`${ten}: "${tu}" thừa khoảng trắng`);
      }
    }
    expect(hong).toEqual([]);
  });

  it('⚑ một từ khoá không được nằm ở hai ô khác nhau', () => {
    // Nằm hai chỗ thì ô nào thắng phụ thuộc thứ tự mảng — tức là đúng/sai do tình cờ.
    const o = new Map<string, string>();
    const hong: string[] = [];
    for (const n of luat.bucketKeywords) {
      for (const tu of n.words) {
        const cu = o.get(tu);
        if (cu !== undefined && cu !== n.bucket) hong.push(`"${tu}" vừa ở ${cu} vừa ở ${n.bucket}`);
        o.set(tu, n.bucket);
      }
    }
    expect(hong).toEqual([]);
  });

  it('⚑ một câu không thể vừa vui vừa buồn', () => {
    const vui = new Set(luat.mood.happy);
    const chung = luat.mood.sad.filter((t) => vui.has(t));
    expect(chung).toEqual([]);
  });
});

describe('parse-rules.json — tên ô phải có thật', () => {
  it('mọi ô thời gian là ô hợp lệ', () => {
    for (const n of luat.bucketKeywords) expect(TIME_BUCKETS).toContain(n.bucket);
    expect(TIME_BUCKETS).toContain(luat.defaultBucket);
  });

  it('mọi ô tiền là ô hợp lệ', () => {
    for (const n of luat.moneyKeywords) expect(VALID_MONEY_CELLS).toContain(n.cell);
    expect(VALID_MONEY_CELLS).toContain(luat.cashWithdrawal.cell);
  });

  it('⚑ năm ô dòng chảy thì cộng, hai ô mức thì đặt lại', () => {
    // Nhầm chỗ này thì "tiêu 350k" ĐÈ chi tiêu cả tháng xuống còn 350 nghìn.
    const cong: Record<string, boolean> = {
      netIncome: true,
      monthlyExpense: true,
      investment: true,
      wastedMoney: true,
      debtPayment: true,
      debtBalance: false,
      netWorth: false,
    };
    for (const n of luat.moneyKeywords) expect([n.cell, n.adds]).toEqual([n.cell, cong[n.cell]]);
  });

  it('⚑ đầu tư và lãng phí đứng TRƯỚC chi tiêu', () => {
    // "mua vàng 5tr" phải thành đầu tư, không thành chi tiêu. Chữ "mua" trần nằm ở
    // nhóm chi tiêu, và docCau dừng ở nhóm đầu tiên khớp — nên thứ tự mảng là luật.
    const thuTu = luat.moneyKeywords.map((n) => n.cell);
    expect(thuTu.indexOf('investment')).toBeLessThan(thuTu.indexOf('monthlyExpense'));
    expect(thuTu.indexOf('wastedMoney')).toBeLessThan(thuTu.indexOf('monthlyExpense'));
  });

  it('⚑ lãng phí là nhóm nước đôi', () => {
    // "lãng phí 30m" phải là ba mươi PHÚT rơi vào ô Lãng phí của màn Thời gian, không
    // phải ba mươi triệu. Để chiTien=true ở đây là tự tay dựng một con số kinh hoàng.
    const lp = luat.moneyKeywords.find((n) => n.cell === 'wastedMoney');
    expect(lp?.moneyOnly).toBe(false);
  });
});

describe('parse-rules.json — cờ giờ vàng', () => {
  it('đang tắt theo quyết định 25/11/2026', () => {
    // Bài kiểm này KHÔNG phải để khoá cứng. Nó để lần bật lại là một quyết định có ý
    // thức: đổi JSON thì phải đổi cả dòng này, và lúc đó người đổi sẽ đọc chú thích.
    expect(luat.goldenHours).toBe(false);
  });
});
