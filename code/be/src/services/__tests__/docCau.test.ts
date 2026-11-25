/**
 * Kiểm tầng đọc câu bằng luật.
 *
 * Tầng này chạy **không cần khoá API**, nên nó là thứ duy nhất giữ cho màn chat còn dùng
 * được khi chưa cấu hình AI. Và vì nó đoán, nó phải đoán ít: mấy test dưới canh cả chỗ
 * nó **phải im** chứ không chỉ chỗ nó phải hiểu.
 */
import { describe, it, expect } from 'vitest';
import { docBangLuat } from '../docCau';

const doc = (cau: string) => docBangLuat(cau);

describe('docBangLuat — giờ', () => {
  it('đọc "sáng nay họp 3 tiếng"', () => {
    const r = doc('sáng nay họp 3 tiếng');
    expect(r.nguon).toBe('luat');
    expect(r.yChi[0]).toMatchObject({ loai: 'gio', bucket: 'work', minutes: 180 });
  });

  it('đọc "lướt điện thoại 45 phút" vào ô lãng phí', () => {
    expect(doc('lướt điện thoại 45 phút').yChi[0]).toMatchObject({
      loai: 'gio',
      bucket: 'waste',
      minutes: 45,
    });
  });

  it('đọc "ngủ 7 tiếng" vào ô cá nhân', () => {
    expect(doc('ngủ 7 tiếng').yChi[0]).toMatchObject({ loai: 'gio', bucket: 'personal', minutes: 420 });
  });

  it('chơi với con là giờ vàng, nấu cơm thì không', () => {
    expect(doc('chơi với con 1 tiếng').yChi[0]).toMatchObject({ bucket: 'family', golden: true });
    expect(doc('nấu cơm 1 tiếng').yChi[0]).toMatchObject({ bucket: 'family', golden: false });
  });

  it('đọc được "1h30" và "1,5h" như nhau', () => {
    expect(doc('họp 1h30').yChi[0]).toMatchObject({ minutes: 90 });
    expect(doc('họp 1,5h').yChi[0]).toMatchObject({ minutes: 90 });
  });

  it('bỏ dấu vẫn đọc được, vì người ta gõ không dấu', () => {
    expect(doc('hop 2 tieng').yChi[0]).toMatchObject({ bucket: 'work', minutes: 120 });
  });

  it('⚑ tên việc cắt số giờ cả khi gõ KHÔNG DẤU', () => {
    // Thiếu chữ `e` trần trong lớp ký tự thì tên ra "Hop 2 tieng", và thẻ hiện
    // "Hop 2 tieng · 2h · Công việc" — lặp lại chính nó.
    expect(doc('chieu nay hop 2 tieng').yChi[0]).toMatchObject({ ten: 'Hop' });
    expect(doc('ngu 7 tieng').yChi[0]).toMatchObject({ ten: 'Ngu' });
    expect(doc('luot dien thoai 45 phut').yChi[0]).toMatchObject({ ten: 'Luot dien thoai' });
  });

  it('tên việc cắt bỏ số giờ và từ chỉ thời điểm', () => {
    expect(doc('sáng nay họp 3 tiếng').yChi[0]).toMatchObject({ ten: 'Họp' });
  });

  it('có số giờ mà không có từ khoá nào thì CHỊU, không đoán ô', () => {
    // "làm cái đó 2 tiếng" — không biết cái đó thuộc ô nào. Đoán bừa tệ hơn im.
    expect(doc('làm cái đó 2 tiếng').nguon).toBe('chiu');
  });

  it('số giờ vô lý thì không nhận', () => {
    expect(doc('họp 30 tiếng').nguon).toBe('chiu');
  });
});

describe('docBangLuat — hạt', () => {
  it('đọc câu vui thành viên kẹo', () => {
    const r = doc('hôm nay vui, con tự xúc cơm');
    expect(r.yChi[0]).toMatchObject({ loai: 'hat', kind: 'candy' });
  });

  it('đọc câu nặng thành hạt muối', () => {
    expect(doc('mệt quá, cả ngày căng thẳng').yChi[0]).toMatchObject({ loai: 'hat', kind: 'salt' });
  });

  it('⚑ câu có cảm xúc KÈM số giờ thì ưu tiên giờ, không thành hạt', () => {
    // "mệt quá, họp 3 tiếng" nói về giờ. Đọc thành hạt muối là bỏ mất mục giờ người ta
    // định ghi, và người dùng không biết nó đi đâu.
    const r = doc('mệt quá, họp 3 tiếng');
    expect(r.yChi[0]?.loai).toBe('gio');
  });

  it('giữ nguyên văn câu làm nội dung hạt', () => {
    const r = doc('Hôm nay vui lắm');
    expect(r.yChi[0]).toMatchObject({ text: 'Hôm nay vui lắm' });
  });
});

describe('docBangLuat — tiền', () => {
  it('đọc "lương tháng này 18 triệu"', () => {
    expect(doc('lương tháng này 18 triệu').yChi[0]).toMatchObject({
      loai: 'tien',
      o: 'netIncome',
      vnd: 18_000_000,
    });
  });

  it('đọc "350k" thành nghìn', () => {
    expect(doc('chi tiêu 350k').yChi[0]).toMatchObject({ o: 'monthlyExpense', vnd: 350_000 });
  });

  it('đọc "1,5tr"', () => {
    expect(doc('trả nợ 1,5tr').yChi[0]).toMatchObject({ o: 'debtPayment', vnd: 1_500_000 });
  });

  it('có số tiền mà không biết ô nào thì CHỊU', () => {
    expect(doc('2 triệu').nguon).toBe('chiu');
  });
});

describe('docBangLuat — việc Mira không ghi', () => {
  it('⚑ "hôm nay rút atm 2 triệu" nói thẳng là không ghi', () => {
    // Rút tiền không làm đổi tài sản ròng. Không chặn thì luật tiền bên dưới sẽ nhét
    // 2 triệu vào một ô nào đó, và con số của người dùng sai mà không ai biết.
    const r = doc('hôm nay rút atm 2 triệu');
    expect(r.nguon).toBe('luat');
    expect(r.yChi[0]?.loai).toBe('khongGhi');
    expect((r.yChi[0] as { viSao: string }).viSao).toContain('tài sản ròng');
  });

  it('chuyển khoản cũng không ghi', () => {
    expect(doc('chuyển khoản 5 triệu sang tiết kiệm').yChi[0]?.loai).toBe('khongGhi');
  });
});

describe('docBangLuat — im lặng', () => {
  it('câu rỗng', () => {
    expect(doc('   ').nguon).toBe('chiu');
  });

  it('câu ngoài ba thứ Mira ghi', () => {
    expect(doc('mai trời có mưa không').nguon).toBe('chiu');
  });

  it('không bao giờ trả về nhiều hơn một ý chí ở tầng luật', () => {
    // Câu nhiều việc là việc của LLM. Tầng luật mà cố tách câu thì nó bắt đầu sai.
    expect(doc('sáng họp 3 tiếng, chiều đưa con đi học 30 phút').yChi.length).toBeLessThanOrEqual(1);
  });
});
