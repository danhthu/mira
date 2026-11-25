/**
 * Kiểm tầng đọc câu bằng luật.
 *
 * Tầng này chạy **không cần khoá API**, nên nó là thứ duy nhất giữ cho màn chat còn dùng
 * được khi chưa cấu hình AI. Và vì nó đoán, nó phải đoán ít: mấy test dưới canh cả chỗ
 * nó **phải im** chứ không chỉ chỗ nó phải hiểu.
 */
import { describe, it, expect } from 'vitest';
import { docBangLuat, type DanhMucGon } from '../docCau';

/** 25/11/2026 là thứ 4. Chọn cố định để test thứ trong tuần không đổi theo ngày chạy. */
const HOM_NAY = '2026-11-25';

const DANH_MUC: readonly DanhMucGon[] = [
  { id: 'dm-hop', name: 'Họp dự án A', bucket: 'work', golden: false },
  { id: 'dm-con', name: 'Đọc sách cho con', bucket: 'family', golden: true },
  { id: 'dm-gym', name: 'Gym', bucket: 'personal', golden: false },
];

const doc = (cau: string, danhMuc: readonly DanhMucGon[] = []) =>
  docBangLuat(cau, { homNay: HOM_NAY, danhMuc });

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

  it('⚑ viết hoa chữ Đ đầu câu vẫn khớp từ khoá', () => {
    // "Đ" hoa là U+0110, một ký tự riêng mà NFD không tách được, nên nó không rơi vào
    // lớp dấu thanh. Hạ chữ thường SAU khi đổi `đ`→`d` thì "Đi làm" ra "đi lam", từ khoá
    // `di lam` không khớp, và cả câu rơi xuống LLM — tức là chết khi chưa có khoá API.
    //
    // Người ta viết hoa chữ đầu câu, nên lỗi này ăn đúng vào những câu hay gõ nhất.
    expect(doc('Đi làm 8 tiếng').yChi[0]).toMatchObject({ bucket: 'work', minutes: 480 });
    expect(doc('Đón con 30 phút').yChi[0]).toMatchObject({ bucket: 'family', minutes: 30 });
    expect(doc('Đọc sách 1 tiếng').yChi[0]).toMatchObject({ bucket: 'personal', minutes: 60 });
  });

  it('⚑ "ăn tối" giữ nguyên chữ "tối", vì đó là bữa ăn chứ không phải thời điểm', () => {
    // Cắt "tối" ở giữa câu thì tên ra "Ăn", và thẻ hiện "Ăn · 30m · Gia đình" — mất đúng
    // cái từ phân biệt bữa tối với bữa sáng.
    expect(doc('ăn tối 30 phút').yChi[0]).toMatchObject({ ten: 'Ăn tối' });
    expect(doc('an toi 30 phut').yChi[0]).toMatchObject({ ten: 'An toi' });
  });

  it('"sáng" / "chiều" / "tối" đứng ĐẦU câu thì vẫn là thời điểm và bị cắt', () => {
    expect(doc('sáng họp 3 tiếng').yChi[0]).toMatchObject({ ten: 'Họp' });
    expect(doc('chiều đón con 30 phút').yChi[0]).toMatchObject({ ten: 'Đón con' });
  });

  it('⚑ chữ "h" trần không được ăn vào chữ cái có dấu đứng sau', () => {
    // Chốt bằng `\b` thì trong "thứ 6 họp" nó cắt luôn "6 h" của "họp" — vì "ọ" không
    // phải `\w` nên `\b` sau "h" lại đúng. Tên việc ra "Thứ ọp".
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ ten: 'Họp' });
    expect(doc('5 ngày trước học 2 tiếng').yChi[0]).toMatchObject({ ten: 'Học' });
  });

  it('có số giờ mà không có từ khoá nào thì CHỊU, không đoán ô', () => {
    // "làm cái đó 2 tiếng" — không biết cái đó thuộc ô nào. Đoán bừa tệ hơn im.
    expect(doc('làm cái đó 2 tiếng').nguon).toBe('chiu');
  });

  it('số giờ vô lý thì không nhận', () => {
    expect(doc('họp 30 tiếng').nguon).toBe('chiu');
  });
});

describe('docBangLuat — ngày', () => {
  it('không nói gì về thời điểm thì là hôm nay', () => {
    expect(doc('họp 2 tiếng').yChi[0]).toMatchObject({ ngay: HOM_NAY });
  });

  it('⚑ "hôm qua ngủ 7 tiếng" ghi vào HÔM QUA', () => {
    // Trước đây câu này đọc ra 420 phút rồi client ghi vào hôm nay: đúng số phút, sai
    // ngày, và không có chỗ nào trên giao diện báo. Sai ngày âm thầm là thứ tệ nhất ở
    // đây — mọi tổng tuần lệch theo mà người dùng không biết vì sao.
    const r = doc('hôm qua ngủ 7 tiếng');
    expect(r.nguon).toBe('luat');
    expect(r.yChi[0]).toMatchObject({ loai: 'gio', minutes: 420, ngay: '2026-11-24' });
  });

  it('"hôm kia" lùi hai ngày, "tối qua" lùi một', () => {
    expect(doc('hôm kia họp 1 tiếng').yChi[0]).toMatchObject({ ngay: '2026-11-23' });
    expect(doc('tối qua lướt điện thoại 30 phút').yChi[0]).toMatchObject({ ngay: '2026-11-24' });
  });

  it('"3 ngày trước" lùi ba ngày, và con số đó KHÔNG bị đọc thành thời lượng', () => {
    // "3 ngày trước họp 2 tiếng" có hai con số. Không cắt cụm ngày ra trước thì có lúc
    // "3" thành thời lượng và mục giờ ghi sai 60 phút.
    const r = doc('3 ngày trước họp 2 tiếng');
    expect(r.yChi[0]).toMatchObject({ ngay: '2026-11-22', minutes: 120, ten: 'Họp' });
  });

  it('⚑ "thứ N" là thứ N GẦN NHẤT ĐÃ QUA, không phải thứ N tới', () => {
    // Màn này là nhật ký: người ta kể việc đã làm. Hiểu ngược chiều là ghi vào tương
    // lai, và một mục giờ ở ngày chưa tới làm lệch mọi tổng tuần.
    expect(doc('thứ 4 họp 2 tiếng').yChi[0]).toMatchObject({ ngay: HOM_NAY }); // hôm nay là thứ 4
    expect(doc('thứ 3 họp 2 tiếng').yChi[0]).toMatchObject({ ngay: '2026-11-24' });
    expect(doc('thứ 2 họp 2 tiếng').yChi[0]).toMatchObject({ ngay: '2026-11-23' });
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ ngay: '2026-11-20' });
    expect(doc('chủ nhật ngủ 9 tiếng').yChi[0]).toMatchObject({ ngay: '2026-11-22' });
  });

  it('không bao giờ trả ngày ở tương lai', () => {
    for (const cau of ['thứ 2 họp 1 tiếng', 'thứ 7 họp 1 tiếng', 'chủ nhật họp 1 tiếng']) {
      const y = doc(cau).yChi[0] as { ngay: string };
      expect(y.ngay <= HOM_NAY).toBe(true);
    }
  });

  it('tên việc không giữ lại cụm chỉ ngày', () => {
    expect(doc('hôm qua họp 2 tiếng').yChi[0]).toMatchObject({ ten: 'Họp' });
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ ten: 'Họp' });
  });

  it('hạt cũng mang ngày của nó', () => {
    expect(doc('hôm qua mệt quá').yChi[0]).toMatchObject({ loai: 'hat', kind: 'salt', ngay: '2026-11-24' });
  });
});

describe('docBangLuat — danh mục người dùng', () => {
  it('⚑ khớp tên danh mục thì lấy ô và cờ giờ vàng CỦA DANH MỤC', () => {
    // Không khớp thì mục giờ ghi ra không có danh mục, màn Thời gian đầy dòng trắng, và
    // cái danh mục người dùng vừa đặt thành vô dụng.
    const r = doc('đọc sách cho con 30 phút', DANH_MUC);
    expect(r.yChi[0]).toMatchObject({
      loai: 'gio',
      bucket: 'family',
      golden: true,
      danhMucId: 'dm-con',
      ten: 'Đọc sách cho con',
      minutes: 30,
    });
  });

  it('danh mục cứu được câu mà danh sách từ khoá gõ cứng không đọc nổi', () => {
    // "dự án A" không có trong TU_KHOA. Có danh mục thì đọc được; không có thì chịu.
    expect(doc('họp dự án A 90 phút', DANH_MUC).yChi[0]).toMatchObject({ danhMucId: 'dm-hop' });
    expect(doc('gym 1 tiếng', DANH_MUC).yChi[0]).toMatchObject({ danhMucId: 'dm-gym', bucket: 'personal' });
    expect(doc('gym 1 tiếng').nguon).toBe('chiu');
  });

  it('tên dài khớp trước tên ngắn', () => {
    const ds: readonly DanhMucGon[] = [
      { id: 'ngan', name: 'Họp', bucket: 'work', golden: false },
      { id: 'dai', name: 'Họp khách hàng', bucket: 'work', golden: false },
    ];
    expect(doc('họp khách hàng 1 tiếng', ds).yChi[0]).toMatchObject({ danhMucId: 'dai' });
  });

  it('⚑ tên dưới ba ký tự thì BỎ QUA', () => {
    // Một danh mục tên "A" khớp gần như mọi câu, và khớp sai là đưa giờ vào sai ô — đắt
    // hơn hẳn việc bỏ sót.
    const ds: readonly DanhMucGon[] = [{ id: 'x', name: 'A', bucket: 'waste', golden: false }];
    expect(doc('ngủ 7 tiếng', ds).yChi[0]).toMatchObject({ bucket: 'personal', danhMucId: null });
  });

  it('không khớp danh mục nào thì danhMucId là null, không phải chuỗi rỗng', () => {
    expect(doc('họp 2 tiếng', DANH_MUC).yChi[0]).toMatchObject({ danhMucId: null });
  });
});

describe('docBangLuat — câu nhiều việc', () => {
  it('⚑ tách được "sáng họp 3 tiếng, chiều đón con 30 phút"', () => {
    // Đây là cách người ta kể một ngày. Trước đây cả câu rơi xuống LLM, tức là chưa có
    // khoá API thì chết hẳn.
    const r = doc('sáng họp 3 tiếng, chiều đón con 30 phút');
    expect(r.nguon).toBe('luat');
    expect(r.yChi).toHaveLength(2);
    expect(r.yChi[0]).toMatchObject({ bucket: 'work', minutes: 180 });
    expect(r.yChi[1]).toMatchObject({ bucket: 'family', minutes: 30 });
  });

  it('tách ở chữ "rồi"', () => {
    const r = doc('ăn tối 30 phút rồi dọn nhà 30 phút');
    expect(r.yChi).toHaveLength(2);
  });

  it('⚑ KHÔNG tách ở chữ "và"', () => {
    // Tách ra thì mảnh đầu không có số giờ, mảnh sau còn "vợ 1 tiếng" không khớp từ
    // khoá nào, và mất nguyên một mục.
    const r = doc('chơi với con và vợ 1 tiếng');
    expect(r.yChi).toHaveLength(1);
    expect(r.yChi[0]).toMatchObject({ bucket: 'family', minutes: 60 });
  });

  it('mỗi mảnh giữ ngày riêng của nó', () => {
    const r = doc('hôm qua họp 2 tiếng, hôm nay ngủ 7 tiếng');
    expect(r.yChi[0]).toMatchObject({ ngay: '2026-11-24' });
    expect(r.yChi[1]).toMatchObject({ ngay: HOM_NAY });
  });

  it('⚑ mảnh có số mà không đọc được thì NÓI RA, không im lặng bỏ', () => {
    // Bỏ lặng lẽ một mảnh có số là làm mất một mục người dùng tưởng đã ghi — họ bấm
    // "Ghi", thấy "Đã ghi", và hai hôm sau mới phát hiện thiếu.
    const r = doc('họp 3 tiếng, làm cái gì đó 2 tiếng');
    expect(r.nguon).toBe('luat');
    expect(r.yChi[0]).toMatchObject({ loai: 'gio', minutes: 180 });
    expect(r.yChi[1]).toMatchObject({ loai: 'chuaHieu' });
    expect((r.yChi[1] as { doan: string }).doan).toContain('làm cái gì đó');
  });

  it('mảnh KHÔNG có số thì bỏ im lặng, vì nó là chữ đệm', () => {
    // "mệt quá" không phải một mục bị mất; nhắc nó ra chỉ làm nhiễu.
    const r = doc('mệt quá, họp 3 tiếng');
    expect(r.yChi).toHaveLength(1);
    expect(r.yChi[0]?.loai).toBe('gio');
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

  it('⚑ một câu nặng nhiều mảnh vẫn chỉ ra MỘT hạt', () => {
    // Hũ muối có nhịp hỏi lại 42 ngày. Nhân đôi một hạt là làm nhiễu đúng chỗ đang đếm.
    expect(doc('mệt quá, cả ngày căng thẳng, chán').yChi).toHaveLength(1);
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
      thang: '2026-11',
    });
  });

  it('đọc "350k" thành nghìn', () => {
    expect(doc('chi tiêu 350k').yChi[0]).toMatchObject({ o: 'monthlyExpense', vnd: 350_000 });
  });

  it('đọc "1,5tr"', () => {
    expect(doc('trả nợ 1,5tr').yChi[0]).toMatchObject({ o: 'debtPayment', vnd: 1_500_000 });
  });

  it('"tháng trước" ghi vào tháng liền trước', () => {
    expect(doc('tháng trước lương 18 triệu').yChi[0]).toMatchObject({ thang: '2026-10' });
  });

  it('có số tiền mà không biết ô nào thì CHỊU', () => {
    expect(doc('2 triệu').nguon).toBe('chiu');
  });
});

describe('docBangLuat — việc Mira không ghi', () => {
  it('⚑ "rút atm 2 triệu" VẪN GHI, vào Chi tiêu tháng', () => {
    // Về kế toán thì rút tiền không đổi tài sản ròng, và Mira từng từ chối ghi vì lý do
    // đó. Founder bác: người gõ câu này vào nhật ký đời sống đang nói "tôi vừa lấy 2
    // triệu ra để tiêu", không hỏi một câu kế toán.
    const r = doc('hôm nay rút atm 2 triệu');
    expect(r.nguon).toBe('luat');
    expect(r.yChi[0]).toMatchObject({ loai: 'tien', o: 'monthlyExpense', vnd: 2_000_000, cong: true });
  });

  it('⚑ "rút 500k" — chữ "rút" TRẦN — vẫn đọc được', () => {
    // Đây là câu Founder gõ thật trên điện thoại lúc 17:15 ngày 25/11, và nó rơi xuống
    // LLM rồi chết vì chưa có khoá API. Luật cũ đòi đủ cụm "rút tiền" / "rút atm", mà
    // không ai gõ đủ cụm đó.
    expect(doc('rút 500k').yChi[0]).toMatchObject({
      loai: 'tien',
      o: 'monthlyExpense',
      vnd: 500_000,
      cong: true,
    });
    expect(doc('rut 500k').nguon).toBe('luat');
  });

  it('⚑ "rút" chỉ tính khi câu CÓ số tiền', () => {
    // Nhánh tiền chỉ chạy sau khi `docTien` bắt được một số tiền, nên "rút kinh nghiệm"
    // không thể lọt vào ô Chi tiêu.
    expect(doc('rút kinh nghiệm').nguon).toBe('chiu');
  });

  it('mấy từ tiêu tiền hay gõ đều vào Chi tiêu tháng', () => {
    for (const cau of ['ăn trưa 50k', 'cafe 35k', 'đổ xăng 100k', 'grab 80k', 'đi chợ 200k']) {
      expect(doc(cau).yChi[0]).toMatchObject({ o: 'monthlyExpense', cong: true });
    }
  });

  it('⚑ "ăn tối 30 phút" vẫn là GIỜ, không phải tiền', () => {
    // "ăn tối" giờ nằm trong cả hai danh sách. Nhánh tiền chỉ chạy khi có số tiền, và
    // "30 phút" không phải số tiền — nếu luật này lỏng ra thì bữa tối thành khoản chi.
    expect(doc('ăn tối 30 phút').yChi[0]).toMatchObject({ loai: 'gio', bucket: 'family' });
  });

  it('⚑ "rút 2 triệu để tiêu" không bị chữ "tiêu" kéo sang luật khác', () => {
    // Cả hai luật cùng trỏ về monthlyExpense nên kết quả giống nhau, nhưng thứ tự khớp
    // phải cố định: rút tiền xét trước.
    expect(doc('rút tiền 2 triệu để tiêu').yChi[0]).toMatchObject({ o: 'monthlyExpense', cong: true });
  });

  it('chuyển tiền giữa tài khoản của mình thì vẫn không ghi', () => {
    // Đây mới thật sự là không đổi gì: tiền sang sổ tiết kiệm vẫn là tiền của mình, ghi
    // thành chi tiêu là báo sai rằng tháng này tiêu nhiều hơn thực tế.
    expect(doc('chuyển khoản 5 triệu sang tiết kiệm').yChi[0]?.loai).toBe('khongGhi');
  });
});

describe('docBangLuat — cộng dồn hay đặt lại', () => {
  it('⚑ ba ô dòng chảy thì CỘNG, không đè', () => {
    // Không có cờ này thì "tiêu 350k" đè chi tiêu cả tháng xuống còn 350 nghìn, xoá mất
    // con số cũ mà không ai báo — và từ khi chat ghi tự động thì nó xoá không cần bấm.
    expect(doc('chi tiêu 350k').yChi[0]).toMatchObject({ o: 'monthlyExpense', cong: true });
    expect(doc('lương tháng này 18 triệu').yChi[0]).toMatchObject({ o: 'netIncome', cong: true });
    expect(doc('trả nợ 1,5tr').yChi[0]).toMatchObject({ o: 'debtPayment', cong: true });
  });

  it('⚑ hai ô mức thì ĐẶT LẠI, không cộng', () => {
    // Dư nợ và tài sản ròng là ảnh chụp tại một thời điểm. Cộng dồn là nhân đôi tài sản
    // của người ta mỗi lần họ khai lại.
    expect(doc('dư nợ 300 triệu').yChi[0]).toMatchObject({ o: 'debtBalance', cong: false });
    expect(doc('tài sản ròng 500 triệu').yChi[0]).toMatchObject({ o: 'netWorth', cong: false });
  });
});

describe('docBangLuat — im lặng', () => {
  it('câu rỗng', () => {
    expect(doc('   ').nguon).toBe('chiu');
  });

  it('câu ngoài ba thứ Mira ghi', () => {
    expect(doc('mai trời có mưa không').nguon).toBe('chiu');
  });
});
