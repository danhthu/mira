/**
 * Kiểm tầng đọc câu bằng luật.
 *
 * Tầng này chạy **không cần khoá API**, nên nó là thứ duy nhất giữ cho màn chat còn dùng
 * được khi chưa cấu hình AI. Và vì nó đoán, nó phải đoán ít: mấy test dưới canh cả chỗ
 * nó **phải im** chứ không chỉ chỗ nó phải hiểu.
 */
import { describe, it, expect } from 'vitest';
import { parseByRules, type CategoryBrief } from '../parseSentence';

/** 25/11/2026 là thứ 4. Chọn cố định để test thứ trong tuần không đổi theo ngày chạy. */
const TODAY = '2026-11-25';

const CATEGORIES: readonly CategoryBrief[] = [
  { id: 'dm-hop', name: 'Họp dự án A', bucket: 'work', golden: false },
  { id: 'dm-con', name: 'Đọc sách cho con', bucket: 'family', golden: true },
  { id: 'dm-gym', name: 'Gym', bucket: 'personal', golden: false },
];

const doc = (cau: string, categories: readonly CategoryBrief[] = []) =>
  parseByRules(cau, { today: TODAY, categories });

describe('docBangLuat — giờ', () => {
  it('đọc "sáng nay họp 3 tiếng"', () => {
    const r = doc('sáng nay họp 3 tiếng');
    expect(r.source).toBe('rules');
    expect(r.yChi[0]).toMatchObject({ kind: 'time', bucket: 'work', minutes: 180 });
  });

  it('đọc "lướt điện thoại 45 phút" vào ô lãng phí', () => {
    expect(doc('lướt điện thoại 45 phút').yChi[0]).toMatchObject({
      kind: 'time',
      bucket: 'waste',
      minutes: 45,
    });
  });

  it('đọc "ngủ 7 tiếng" vào ô cá nhân', () => {
    expect(doc('ngủ 7 tiếng').yChi[0]).toMatchObject({
      kind: 'time',
      bucket: 'personal',
      minutes: 420,
    });
  });

  it('⚑ GIỜ VÀNG ĐANG TẮT: không câu nào còn gắn cờ vàng nữa', () => {
    // Founder tạm bỏ khái niệm giờ vàng ngày 25/11/2026 (`gioVang: false` trong
    // `parse-rules.json`). "chơi với con" vẫn vào ô Gia đình — chỉ cái cờ là thôi.
    //
    // Cột `golden` dưới CSDL còn nguyên và mục cũ vẫn giữ cờ cũ, nên bật lại là đổi một
    // chữ trong JSON chứ không phải viết lại gì.
    expect(doc('chơi với con 1 tiếng').yChi[0]).toMatchObject({ bucket: 'family', golden: false });
    expect(doc('nấu cơm 1 tiếng').yChi[0]).toMatchObject({ bucket: 'family', golden: false });
  });

  it('⚑ "1h30" không để sót "30" lại trong tên việc', () => {
    // Luật cắt thời lượng chỉ ăn "1h" rồi bỏ "30" nằm lại, nên thẻ hiện "Họp 30": số
    // phút đúng mà tên thì vô nghĩa. Mô phỏng một tháng lôi lỗi này ra.
    expect(doc('họp 1h30').yChi[0]).toMatchObject({ name: 'Họp', minutes: 90 });
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
    expect(doc('chieu nay hop 2 tieng').yChi[0]).toMatchObject({ name: 'Hop' });
    expect(doc('ngu 7 tieng').yChi[0]).toMatchObject({ name: 'Ngu' });
    expect(doc('luot dien thoai 45 phut').yChi[0]).toMatchObject({ name: 'Luot dien thoai' });
  });

  it('tên việc cắt bỏ số giờ và từ chỉ thời điểm', () => {
    expect(doc('sáng nay họp 3 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
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
    expect(doc('ăn tối 30 phút').yChi[0]).toMatchObject({ name: 'Ăn tối' });
    expect(doc('an toi 30 phut').yChi[0]).toMatchObject({ name: 'An toi' });
  });

  it('"sáng" / "chiều" / "tối" đứng ĐẦU câu thì vẫn là thời điểm và bị cắt', () => {
    expect(doc('sáng họp 3 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
    expect(doc('chiều đón con 30 phút').yChi[0]).toMatchObject({ name: 'Đón con' });
  });

  it('⚑ chữ "h" trần không được ăn vào chữ cái có dấu đứng sau', () => {
    // Chốt bằng `\b` thì trong "thứ 6 họp" nó cắt luôn "6 h" của "họp" — vì "ọ" không
    // phải `\w` nên `\b` sau "h" lại đúng. Tên việc ra "Thứ ọp".
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
    expect(doc('5 ngày trước học 2 tiếng').yChi[0]).toMatchObject({ name: 'Học' });
  });

  it('⚑ có thời lượng và tên việc mà không từ khoá nào nhận ra thì VẪN GHI, kèm cờ đoán', () => {
    // Luật cũ chịu ở đây, và câu rơi xuống LLM. Không có khoá API thì rơi xuống đất:
    // Founder gõ "thể dục 30 phút" và nhận về một dòng lỗi tên biến môi trường.
    //
    // Mất hẳn 30 phút tệ hơn xếp nhầm ô. Ô sai sửa một cú chạm; mục không ghi thì tuần
    // sau không ai nhớ ra để mà sửa.
    const r = doc('làm cái đó 2 tiếng');
    expect(r.source).toBe('rules');
    expect(r.yChi[0]).toMatchObject({
      kind: 'time',
      minutes: 120,
      name: 'Làm cái đó',
      bucket: 'personal',
      bucketGuessed: true,
    });
  });

  it('⚑ câu Founder gõ thật: "thể dục 30 phút" vào Cá nhân, KHÔNG phải đoán', () => {
    // Đây là câu đã chết trên điện thoại Founder. Từ khoá `the duc` trần giờ có thật,
    // nên nó vào đúng ô bằng luật chứ không nhờ lưới hứng.
    expect(doc('thể dục 30 phút').yChi[0]).toMatchObject({
      kind: 'time',
      minutes: 30,
      name: 'Thể dục',
      bucket: 'personal',
      bucketGuessed: false,
    });
  });

  it('⚑ chỉ có con số, không có tên việc thì CHỊU', () => {
    // "30 phút" ghi ra được cái gì? Một dòng "Ghi tay · 30m · Cá nhân" mà tuần sau đọc
    // lại cũng không ai biết nó là gì. Thà không ghi.
    expect(doc('30 phút').source).toBe('unparsed');
  });

  it('số giờ vô lý thì không nhận', () => {
    expect(doc('họp 30 tiếng').source).toBe('unparsed');
  });
});

describe('docBangLuat — ngày', () => {
  it('không nói gì về thời điểm thì là hôm nay', () => {
    expect(doc('họp 2 tiếng').yChi[0]).toMatchObject({ date: TODAY });
  });

  it('⚑ "hôm qua ngủ 7 tiếng" ghi vào HÔM QUA', () => {
    // Trước đây câu này đọc ra 420 phút rồi client ghi vào hôm nay: đúng số phút, sai
    // ngày, và không có chỗ nào trên giao diện báo. Sai ngày âm thầm là thứ tệ nhất ở
    // đây — mọi tổng tuần lệch theo mà người dùng không biết vì sao.
    const r = doc('hôm qua ngủ 7 tiếng');
    expect(r.source).toBe('rules');
    expect(r.yChi[0]).toMatchObject({ kind: 'time', minutes: 420, date: '2026-11-24' });
  });

  it('"hôm kia" lùi hai ngày, "tối qua" lùi một', () => {
    expect(doc('hôm kia họp 1 tiếng').yChi[0]).toMatchObject({ date: '2026-11-23' });
    expect(doc('tối qua lướt điện thoại 30 phút').yChi[0]).toMatchObject({ date: '2026-11-24' });
  });

  it('"3 ngày trước" lùi ba ngày, và con số đó KHÔNG bị đọc thành thời lượng', () => {
    // "3 ngày trước họp 2 tiếng" có hai con số. Không cắt cụm ngày ra trước thì có lúc
    // "3" thành thời lượng và mục giờ ghi sai 60 phút.
    const r = doc('3 ngày trước họp 2 tiếng');
    expect(r.yChi[0]).toMatchObject({ date: '2026-11-22', minutes: 120, name: 'Họp' });
  });

  it('⚑ "thứ N" là thứ N GẦN NHẤT ĐÃ QUA, không phải thứ N tới', () => {
    // Màn này là nhật ký: người ta kể việc đã làm. Hiểu ngược chiều là ghi vào tương
    // lai, và một mục giờ ở ngày chưa tới làm lệch mọi tổng tuần.
    expect(doc('thứ 4 họp 2 tiếng').yChi[0]).toMatchObject({ date: TODAY }); // hôm nay là thứ 4
    expect(doc('thứ 3 họp 2 tiếng').yChi[0]).toMatchObject({ date: '2026-11-24' });
    expect(doc('thứ 2 họp 2 tiếng').yChi[0]).toMatchObject({ date: '2026-11-23' });
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ date: '2026-11-20' });
    expect(doc('chủ nhật ngủ 9 tiếng').yChi[0]).toMatchObject({ date: '2026-11-22' });
  });

  it('không bao giờ trả ngày ở tương lai', () => {
    for (const cau of ['thứ 2 họp 1 tiếng', 'thứ 7 họp 1 tiếng', 'chủ nhật họp 1 tiếng']) {
      const y = doc(cau).yChi[0] as unknown as { date: string };
      expect(y.date <= TODAY).toBe(true);
    }
  });

  it('tên việc không giữ lại cụm chỉ ngày', () => {
    expect(doc('hôm qua họp 2 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
    expect(doc('thứ 6 họp 2 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
  });

  it('hạt cũng mang ngày của nó', () => {
    expect(doc('hôm qua mệt quá').yChi[0]).toMatchObject({
      kind: 'grain',
      grain: 'salt',
      date: '2026-11-24',
    });
  });
});

describe('docBangLuat — danh mục người dùng', () => {
  it('⚑ khớp tên danh mục thì lấy ô và cờ giờ vàng CỦA DANH MỤC', () => {
    // Không khớp thì mục giờ ghi ra không có danh mục, màn Thời gian đầy dòng trắng, và
    // cái danh mục người dùng vừa đặt thành vô dụng.
    const r = doc('đọc sách cho con 30 phút', CATEGORIES);
    expect(r.yChi[0]).toMatchObject({
      kind: 'time',
      bucket: 'family',
      golden: true,
      categoryId: 'dm-con',
      name: 'Đọc sách cho con',
      minutes: 30,
    });
  });

  it('danh mục cứu được câu mà danh sách từ khoá gõ cứng không đọc nổi', () => {
    // "dự án A" không có trong TU_KHOA. Có danh mục thì đọc được; không có thì chịu.
    expect(doc('họp dự án A 90 phút', CATEGORIES).yChi[0]).toMatchObject({ categoryId: 'dm-hop' });
    expect(doc('gym 1 tiếng', CATEGORIES).yChi[0]).toMatchObject({
      categoryId: 'dm-gym',
      bucket: 'personal',
    });
    // Không có danh mục thì vẫn đọc được bằng từ khoá — nhưng không gắn được danh mục.
    expect(doc('gym 1 tiếng').yChi[0]).toMatchObject({ categoryId: null, bucket: 'personal' });
  });

  it('tên dài khớp trước tên ngắn', () => {
    const ds: readonly CategoryBrief[] = [
      { id: 'ngan', name: 'Họp', bucket: 'work', golden: false },
      { id: 'dai', name: 'Họp khách hàng', bucket: 'work', golden: false },
    ];
    expect(doc('họp khách hàng 1 tiếng', ds).yChi[0]).toMatchObject({ categoryId: 'dai' });
  });

  it('⚑ tên dưới ba ký tự thì BỎ QUA', () => {
    // Một danh mục tên "A" khớp gần như mọi câu, và khớp sai là đưa giờ vào sai ô — đắt
    // hơn hẳn việc bỏ sót.
    const ds: readonly CategoryBrief[] = [{ id: 'x', name: 'A', bucket: 'waste', golden: false }];
    expect(doc('ngủ 7 tiếng', ds).yChi[0]).toMatchObject({ bucket: 'personal', categoryId: null });
  });

  it('không khớp danh mục nào thì danhMucId là null, không phải chuỗi rỗng', () => {
    expect(doc('họp 2 tiếng', CATEGORIES).yChi[0]).toMatchObject({ categoryId: null });
  });
});

describe('docBangLuat — câu nhiều việc', () => {
  it('⚑ tách được "sáng họp 3 tiếng, chiều đón con 30 phút"', () => {
    // Đây là cách người ta kể một ngày. Trước đây cả câu rơi xuống LLM, tức là chưa có
    // khoá API thì chết hẳn.
    const r = doc('sáng họp 3 tiếng, chiều đón con 30 phút');
    expect(r.source).toBe('rules');
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
    expect(r.yChi[0]).toMatchObject({ date: '2026-11-24' });
    expect(r.yChi[1]).toMatchObject({ date: TODAY });
  });

  it('⚑ mảnh có số mà không đọc được thì NÓI RA, không im lặng bỏ', () => {
    // Bỏ lặng lẽ một mảnh có số là làm mất một mục người dùng tưởng đã ghi — họ bấm
    // "Ghi", thấy "Đã ghi", và hai hôm sau mới phát hiện thiếu.
    // Mảnh "tiền nong 500" có chữ số mà không ra nổi gì: 500 trần không phải số tiền
    // (thiếu đơn vị), cũng không phải thời lượng. Nó phải được NÓI RA.
    const r = doc('họp 3 tiếng, tiền nong 500');
    expect(r.source).toBe('rules');
    expect(r.yChi[0]).toMatchObject({ kind: 'time', minutes: 180 });
    expect(r.yChi[1]).toMatchObject({ kind: 'unclear' });
    expect((r.yChi[1] as { excerpt: string }).excerpt).toContain('tiền nong 500');
  });

  it('mảnh KHÔNG có số thì bỏ im lặng, vì nó là chữ đệm', () => {
    // "mệt quá" không phải một mục bị mất; nhắc nó ra chỉ làm nhiễu.
    const r = doc('mệt quá, họp 3 tiếng');
    expect(r.yChi).toHaveLength(1);
    expect(r.yChi[0]?.kind).toBe('time');
  });
});

describe('docBangLuat — hạt', () => {
  it('đọc câu vui thành viên kẹo', () => {
    const r = doc('hôm nay vui, con tự xúc cơm');
    expect(r.yChi[0]).toMatchObject({ kind: 'grain', grain: 'candy' });
  });

  it('đọc câu nặng thành hạt muối', () => {
    expect(doc('mệt quá, cả ngày căng thẳng').yChi[0]).toMatchObject({
      kind: 'grain',
      grain: 'salt',
    });
  });

  it('⚑ câu Founder gõ thật: "hôm nay gặp khó khăn với khách hàng" là hạt muối', () => {
    // Câu này rơi xuống "Mira chưa hiểu" chỉ vì danh sách cũ thiếu chữ "khó khăn" —
    // mà đây đúng là dạng câu người ta mở app ra để viết.
    expect(doc('hôm nay gặp khó khăn với khách hàng').yChi[0]).toMatchObject({
      kind: 'grain',
      grain: 'salt',
    });
  });

  it('nhận thêm các cách nói thường gặp', () => {
    const muoi = [
      'công việc hôm nay vất vả',
      'thấy bế tắc',
      'bực bội cả buổi',
      'lo lắng chuyện tiền',
    ];
    for (const c of muoi) expect(doc(c).yChi[0]).toMatchObject({ grain: 'salt' });
    const keo = ['hôm nay thoải mái', 'tự hào về con', 'mọi thứ suôn sẻ', 'xong việc sớm'];
    for (const c of keo) expect(doc(c).yChi[0]).toMatchObject({ grain: 'candy' });
  });

  it('⚑ "lo lắng chuyện tiền" là hạt muối, KHÔNG phải bài giảng chuyển khoản', () => {
    // Bỏ dấu xong "chuyện tiền" và "chuyển tiền" giống hệt nhau. Câu này từng bị trả về
    // "chuyển tiền giữa các tài khoản của bạn không làm đổi tổng tài sản" — vô nghĩa, và
    // đúng vào lúc người ta đang lo.
    expect(doc('lo lắng chuyện tiền').yChi[0]).toMatchObject({ kind: 'grain', grain: 'salt' });
  });

  it('⚑ KHÔNG nhận chữ trần mơ hồ: "kho cá" không phải hạt muối', () => {
    // Bỏ dấu xong thì "khó" và "kho" giống hệt nhau. Nhận chữ trần thì bữa kho cá thành
    // một hạt muối trong hũ, và hũ muối có nhịp hỏi lại 42 ngày — nhiễu đúng chỗ đang đếm.
    expect(doc('kho cá').source).toBe('unparsed');
  });

  it('⚑ một câu nặng nhiều mảnh vẫn chỉ ra MỘT hạt', () => {
    // Hũ muối có nhịp hỏi lại 42 ngày. Nhân đôi một hạt là làm nhiễu đúng chỗ đang đếm.
    expect(doc('mệt quá, cả ngày căng thẳng, chán').yChi).toHaveLength(1);
  });

  it('⚑ câu có cảm xúc KÈM số giờ thì ưu tiên giờ, không thành hạt', () => {
    // "mệt quá, họp 3 tiếng" nói về giờ. Đọc thành hạt muối là bỏ mất mục giờ người ta
    // định ghi, và người dùng không biết nó đi đâu.
    const r = doc('mệt quá, họp 3 tiếng');
    expect(r.yChi[0]?.kind).toBe('time');
  });

  it('giữ nguyên văn câu làm nội dung hạt', () => {
    const r = doc('Hôm nay vui lắm');
    expect(r.yChi[0]).toMatchObject({ text: 'Hôm nay vui lắm' });
  });
});

describe('docBangLuat — tiền', () => {
  it('đọc "lương tháng này 18 triệu"', () => {
    expect(doc('lương tháng này 18 triệu').yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'netIncome',
      vnd: 18_000_000,
      month: '2026-11',
    });
  });

  it('đọc "350k" thành nghìn', () => {
    expect(doc('chi tiêu 350k').yChi[0]).toMatchObject({ cell: 'monthlyExpense', vnd: 350_000 });
  });

  it('đọc "1,5tr"', () => {
    expect(doc('trả nợ 1,5tr').yChi[0]).toMatchObject({ cell: 'debtPayment', vnd: 1_500_000 });
  });

  it('"tháng trước" ghi vào tháng liền trước', () => {
    expect(doc('tháng trước lương 18 triệu').yChi[0]).toMatchObject({ month: '2026-10' });
  });

  it('⚑ có số tiền mà không biết ô nào thì NÓI RA BẢY Ô, không đoán và không im', () => {
    // Founder gõ "vốn tự có 3tr" và nhận về "Mira chưa hiểu câu này" — mà Mira hiểu rõ
    // đây là tiền, nó chỉ không biết bỏ vào ô nào. Nói ra điều mình biết thì dẫn được
    // người ta tới câu đúng.
    //
    // KHÔNG đoán ô: tài sản ròng chia chi tiêu tháng ra "vốn tự do", con số đầu màn Tài
    // chính. Nhét bừa 3tr vào đó là báo "0,2 tháng tự do" — vừa sai vừa đáng sợ.
    for (const c of ['2 triệu', 'vốn tự có 3tr', 'vốn: 3tr']) {
      const r = doc(c);
      expect(r.source).toBe('rules');
      expect(r.yChi[0]).toMatchObject({ kind: 'notRecorded' });
      expect((r.yChi[0] as { why: string }).why).toContain('bảy ô tiền');
    }
  });

  it('câu không có số tiền thì vẫn chịu như cũ', () => {
    expect(doc('abcxyz').source).toBe('unparsed');
  });
});

describe('docBangLuat — việc Mira không ghi', () => {
  it('⚑ "rút atm 2 triệu" VẪN GHI, vào Chi tiêu tháng', () => {
    // Về kế toán thì rút tiền không đổi tài sản ròng, và Mira từng từ chối ghi vì lý do
    // đó. Founder bác: người gõ câu này vào nhật ký đời sống đang nói "tôi vừa lấy 2
    // triệu ra để tiêu", không hỏi một câu kế toán.
    const r = doc('hôm nay rút atm 2 triệu');
    expect(r.source).toBe('rules');
    expect(r.yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      vnd: 2_000_000,
      adds: true,
    });
  });

  it('⚑ "rút 500k" — chữ "rút" TRẦN — vẫn đọc được', () => {
    // Đây là câu Founder gõ thật trên điện thoại lúc 17:15 ngày 25/11, và nó rơi xuống
    // LLM rồi chết vì chưa có khoá API. Luật cũ đòi đủ cụm "rút tiền" / "rút atm", mà
    // không ai gõ đủ cụm đó.
    expect(doc('rút 500k').yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      vnd: 500_000,
      adds: true,
    });
    expect(doc('rut 500k').source).toBe('rules');
  });

  it('⚑ "rút" chỉ tính khi câu CÓ số tiền', () => {
    // Nhánh tiền chỉ chạy sau khi `docTien` bắt được một số tiền, nên "rút kinh nghiệm"
    // không thể lọt vào ô Chi tiêu.
    expect(doc('rút kinh nghiệm').source).toBe('unparsed');
  });

  it('mấy từ tiêu tiền hay gõ đều vào Chi tiêu tháng', () => {
    for (const cau of ['ăn trưa 50k', 'cafe 35k', 'đổ xăng 100k', 'grab 80k', 'đi chợ 200k']) {
      expect(doc(cau).yChi[0]).toMatchObject({ cell: 'monthlyExpense', adds: true });
    }
  });

  it('⚑ "ăn tối 30 phút" vẫn là GIỜ, không phải tiền', () => {
    // "ăn tối" giờ nằm trong cả hai danh sách. Nhánh tiền chỉ chạy khi có số tiền, và
    // "30 phút" không phải số tiền — nếu luật này lỏng ra thì bữa tối thành khoản chi.
    expect(doc('ăn tối 30 phút').yChi[0]).toMatchObject({ kind: 'time', bucket: 'family' });
  });

  it('⚑ "rút 2 triệu để tiêu" không bị chữ "tiêu" kéo sang luật khác', () => {
    // Cả hai luật cùng trỏ về monthlyExpense nên kết quả giống nhau, nhưng thứ tự khớp
    // phải cố định: rút tiền xét trước.
    expect(doc('rút tiền 2 triệu để tiêu').yChi[0]).toMatchObject({
      cell: 'monthlyExpense',
      adds: true,
    });
  });

  it('chuyển tiền giữa tài khoản của mình thì vẫn không ghi', () => {
    // Đây mới thật sự là không đổi gì: tiền sang sổ tiết kiệm vẫn là tiền của mình, ghi
    // thành chi tiêu là báo sai rằng tháng này tiêu nhiều hơn thực tế.
    expect(doc('chuyển khoản 5 triệu sang tiết kiệm').yChi[0]?.kind).toBe('notRecorded');
  });
});

describe('docBangLuat — cộng dồn hay đặt lại', () => {
  it('⚑ ba ô dòng chảy thì CỘNG, không đè', () => {
    // Không có cờ này thì "tiêu 350k" đè chi tiêu cả tháng xuống còn 350 nghìn, xoá mất
    // con số cũ mà không ai báo — và từ khi chat ghi tự động thì nó xoá không cần bấm.
    expect(doc('chi tiêu 350k').yChi[0]).toMatchObject({ cell: 'monthlyExpense', adds: true });
    expect(doc('lương tháng này 18 triệu').yChi[0]).toMatchObject({
      cell: 'netIncome',
      adds: true,
    });
    expect(doc('trả nợ 1,5tr').yChi[0]).toMatchObject({ cell: 'debtPayment', adds: true });
  });

  it('⚑ hai ô mức thì ĐẶT LẠI, không cộng', () => {
    // Dư nợ và tài sản ròng là ảnh chụp tại một thời điểm. Cộng dồn là nhân đôi tài sản
    // của người ta mỗi lần họ khai lại.
    expect(doc('dư nợ 300 triệu').yChi[0]).toMatchObject({ cell: 'debtBalance', adds: false });
    expect(doc('tài sản ròng 500 triệu').yChi[0]).toMatchObject({ cell: 'netWorth', adds: false });
  });

  it('đầu tư vào đúng ô, và cộng dồn', () => {
    expect(doc('đầu tư 5tr').yChi[0]).toMatchObject({
      cell: 'investment',
      vnd: 5_000_000,
      adds: true,
    });
    expect(doc('gửi tiết kiệm 20 triệu').yChi[0]).toMatchObject({ cell: 'investment' });
    expect(doc('mua cổ phiếu 3tr').yChi[0]).toMatchObject({ cell: 'investment' });
  });

  it('⚑ "mua vàng" là đầu tư, không phải chi tiêu', () => {
    // Chữ "mua" trần nằm ở nhóm chi tiêu. docCau dừng ở nhóm ĐẦU TIÊN khớp, nên nhóm đầu
    // tư phải đứng trước trong parse-rules.json. Đảo thứ tự là "mua vàng 10tr" thành một
    // khoản tiêu mất, và tài sản ròng không bao giờ lớn lên.
    expect(doc('mua vàng 10tr').yChi[0]).toMatchObject({ cell: 'investment', vnd: 10_000_000 });
  });

  it('lãng phí tiền vào ô lãng phí', () => {
    expect(doc('lãng phí 300k').yChi[0]).toMatchObject({
      cell: 'wastedMoney',
      vnd: 300_000,
      adds: true,
    });
    expect(doc('tiêu hoang 500k').yChi[0]).toMatchObject({ cell: 'wastedMoney' });
  });

  it('⚑ "lãng phí 30m" là BA MƯƠI PHÚT, không phải ba mươi triệu', () => {
    // Nhóm lãng phí là nhóm nước đôi: nó đo được cả tiền lẫn thời gian. Để chiTien=true
    // thì chữ "m" thành "triệu" và một câu ghi giờ biến thành 30 triệu tiền lãng phí —
    // sai kiểu người dùng không ngờ tới và không biết tìm đâu để sửa.
    expect(doc('lãng phí 30m').yChi[0]).toMatchObject({
      kind: 'time',
      bucket: 'waste',
      minutes: 30,
    });
  });

  it('"đầu tư 2 tiếng học tiếng Anh" vẫn là giờ', () => {
    // "tiếng" không phải đơn vị tiền, nên nhánh tiền bỏ qua dù từ khoá đầu tư có khớp.
    expect(doc('đầu tư 2 tiếng học tiếng anh').yChi[0]).toMatchObject({
      kind: 'time',
      minutes: 120,
    });
  });
});

describe('docBangLuat — im lặng', () => {
  it('câu rỗng', () => {
    expect(doc('   ').source).toBe('unparsed');
  });

  it('câu ngoài ba thứ Mira ghi — nhận ra là câu hỏi, nói thẳng mình làm được gì', () => {
    // Trước đây câu này trả 'chiu' và người dùng nhận về "Mira chưa hiểu câu này". Nó có
    // chữ "không" nên rõ ràng là một câu hỏi — chỉ là Mira không trả lời được. Nói
    // "tôi chỉ ghi nhật ký, đây là thứ tôi làm được" thì thật thà hơn và dùng được hơn.
    expect(doc('mai trời có mưa không').yChi[0]).toMatchObject({
      kind: 'question',
      topic: 'unclear',
    });
  });
});

describe('docBangLuat — câu hỏi', () => {
  const question = (c: string) => doc(c).yChi[0];

  it('⚑ câu Founder gõ thật: "xem ở đâu" là câu hỏi, không phải "chưa hiểu"', () => {
    expect(question('xem ở đâu')).toMatchObject({ kind: 'question', topic: 'whereIsIt' });
  });

  it('nhận đúng chủ đề', () => {
    expect(question('ghi thế nào')).toMatchObject({ topic: 'howToLog' });
    expect(question('sửa ở đâu')).toMatchObject({ topic: 'whereIsIt' });
    expect(question('hôm nay thế nào')).toMatchObject({ topic: 'today' });
    expect(question('tuần này bao nhiêu')).toMatchObject({ topic: 'thisWeek' });
    expect(question('tiền thế nào')).toMatchObject({ topic: 'money' });
    expect(question('hũ ra sao')).toMatchObject({ topic: 'jar' });
  });

  it('biết là câu hỏi mà không rõ hỏi gì thì vẫn trả lời', () => {
    // Tốt hơn "Mira chưa hiểu": nó nói đúng cái người ta cần biết — Mira làm được gì.
    expect(question('cái này là sao')).toMatchObject({ kind: 'question', topic: 'unclear' });
  });

  it('dấu hỏi một mình cũng đủ', () => {
    expect(question('tiền?')).toMatchObject({ kind: 'question', topic: 'money' });
  });

  it('⚑ GHI ĐƯỢC THÌ GHI, không hỏi han gì', () => {
    // Đây là luật quan trọng nhất của tầng này. "hôm nay họp 2 tiếng" có chữ "hôm nay"
    // — nếu câu hỏi thắng thì Mira trả lời thay vì ghi, và mục biến mất.
    expect(question('hôm nay họp 2 tiếng')).toMatchObject({ kind: 'time', minutes: 120 });
    expect(question('hôm nay tiêu 350k')).toMatchObject({ kind: 'money', vnd: 350000 });
  });

  it('⚑ câu hỏi thắng cảm xúc', () => {
    // "hôm nay có vui không" có chữ "vui". Không xét câu hỏi trước thì nó thành một viên
    // kẹo — Mira tự ghi một ngày vui mà người ta chỉ đang hỏi.
    expect(question('hôm nay có vui không')).toMatchObject({ kind: 'question' });
  });

  it('⚑ KHÔNG có dấu hiệu hỏi thì KHÔNG phải câu hỏi', () => {
    // Không đòi dấu hiệu hỏi thì mọi câu không đọc được đều thành câu hỏi, và Mira trả
    // lời linh tinh thay vì nói thật là chưa hiểu.
    expect(doc('mệt quá').yChi[0]).toMatchObject({ kind: 'grain', grain: 'salt' });
    expect(doc('abcxyz').source).toBe('unparsed');
  });
});

describe('docBangLuat — đặt lời nhắc', () => {
  const nhac = (c: string) => doc(c).yChi[0];

  it('⚑ câu Founder gõ thật: "tạo lịch nhắc 8h hàng ngày"', () => {
    // Câu này từng ghi ra một mục giờ 8 TIẾNG tên "Tạo lịch nhắc hàng ngày". Trong câu
    // ghi việc thì "8h" là thời lượng; trong câu đặt nhắc nó là giờ trên đồng hồ.
    expect(nhac('tạo lịch nhắc 8h hàng ngày')).toEqual({
      kind: 'reminder',
      at: '08:00',
      days: '1234567',
      text: null,
    });
  });

  it('rút được lời nhắc từ phần còn lại của câu', () => {
    expect(nhac('nhắc tôi uống thuốc 21h hàng ngày')).toMatchObject({
      at: '21:00',
      days: '1234567',
      text: 'Uống thuốc',
    });
  });

  it('đọc được các cách nói thứ', () => {
    expect(nhac('nhắc 7h ngày thường')).toMatchObject({ at: '07:00', days: '12345' });
    expect(nhac('nhắc 9h cuối tuần')).toMatchObject({ at: '09:00', days: '67' });
    expect(nhac('nhắc 20h thứ 3 thứ 5')).toMatchObject({ at: '20:00', days: '24' });
    expect(nhac('nhắc 6h chủ nhật')).toMatchObject({ at: '06:00', days: '7' });
  });

  it('không nói thứ nào thì mỗi ngày', () => {
    expect(nhac('nhắc 22h')).toMatchObject({ days: '1234567' });
  });

  it('đọc được phút và dấu hai chấm', () => {
    expect(nhac('nhắc 21:30 hàng ngày')).toMatchObject({ at: '21:30' });
    expect(nhac('nhắc 7h30')).toMatchObject({ at: '07:30' });
  });

  it('⚑ buổi phải đứng NGAY SAU con số', () => {
    // Bỏ dấu xong "tối" thành "toi", trùng đại từ "tôi". Nhận chữ trần ở bất kỳ đâu thì
    // "nhắc tôi 8h" thành 8 giờ TỐI — sai mười hai tiếng.
    expect(nhac('nhắc 8h tối')).toMatchObject({ at: '20:00' });
    expect(nhac('nhắc tôi 8h')).toMatchObject({ at: '08:00' });
  });

  it('⚑ "2 tiếng" KHÔNG phải giờ đồng hồ', () => {
    // "nhắc lại chuyện cũ 2 tiếng" có chữ "nhắc", nhưng "2 tiếng" là thời lượng. Nhận
    // nhầm thì nó thành lời nhắc lúc 2 giờ sáng.
    expect(nhac('nhắc lại chuyện cũ 2 tiếng')).toMatchObject({ kind: 'time', minutes: 120 });
    expect(nhac('nhắc việc 30 phút')).toMatchObject({ kind: 'time', minutes: 30 });
  });

  it('có từ khoá nhắc mà không có giờ thì không đặt nhắc', () => {
    // "nhắc" không kèm giờ thì chưa đủ để đặt gì. Đoán bừa một giờ còn tệ hơn.
    expect(doc('nhắc tôi đi').source).toBe('unparsed');
  });
});

describe('docBangLuat — ngày viết thẳng', () => {
  it('⚑ "ngày 3/11 họp 2 tiếng" ghi vào 3/11, KHÔNG phải hôm nay', () => {
    // Mô phỏng một tháng bắt được: câu này ghi vào hôm nay, sai ngày mà không báo gì.
    // Cùng loại lỗi với "hôm qua ngủ 7 tiếng" đã sửa trước đó, chỉ khác cách gõ.
    expect(doc('ngày 3/11 họp 2 tiếng').yChi[0]).toMatchObject({
      kind: 'time',
      minutes: 120,
      date: '2026-11-03',
    });
  });

  it('không có chữ "ngày" cũng đọc được', () => {
    expect(doc('3/11 họp 2 tiếng').yChi[0]).toMatchObject({ date: '2026-11-03' });
  });

  it('ghi cả năm thì theo năm đó', () => {
    expect(doc('20/10/2026 đi ăn cưới 3 tiếng').yChi[0]).toMatchObject({ date: '2026-10-20' });
  });

  it('⚑ ngày ở TƯƠNG LAI thì hiểu là năm ngoái', () => {
    // Hôm nay 25/11/2026. "20/12" không thể là tháng sau — đây là nhật ký, người ta kể
    // việc đã làm. Một mục giờ ở ngày chưa tới làm lệch mọi tổng tuần.
    expect(doc('20/12 đi ăn cưới 3 tiếng').yChi[0]).toMatchObject({ date: '2025-12-20' });
  });

  it('⚑ ngày không có thật thì bỏ qua, không đoán', () => {
    // 31/2 không tồn tại. `Date` tự trượt sang 3/3 nếu để nó tính — im lặng sai ngày.
    expect(doc('31/2 họp 2 tiếng').yChi[0]).toMatchObject({ date: TODAY });
  });

  it('⚑ ngày bị cắt khỏi TÊN VIỆC', () => {
    // Không cắt thì thẻ hiện "Ngày 3/11 họp" — con số ngày dính vào tên việc.
    expect(doc('ngày 3/11 họp 2 tiếng').yChi[0]).toMatchObject({ name: 'Họp' });
  });
});

describe('docBangLuat — đơn vị "m"', () => {
  it('⚑ câu Founder gõ thật: "trả nợ 4m" là bốn triệu', () => {
    expect(doc('trả nợ 4m').yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'debtPayment',
      vnd: 4_000_000,
    });
  });

  it('nhận "m" ở mọi ô chỉ-tiền', () => {
    expect(doc('lương 18m').yChi[0]).toMatchObject({ cell: 'netIncome', vnd: 18_000_000 });
    expect(doc('dư nợ 200m').yChi[0]).toMatchObject({ cell: 'debtBalance', vnd: 200_000_000 });
    expect(doc('tài sản ròng 1500m').yChi[0]).toMatchObject({
      cell: 'netWorth',
      vnd: 1_500_000_000,
    });
    expect(doc('chi tiêu 12m').yChi[0]).toMatchObject({ cell: 'monthlyExpense', vnd: 12_000_000 });
    expect(doc('rút 4m').yChi[0]).toMatchObject({ cell: 'monthlyExpense', vnd: 4_000_000 });
  });

  it('⚑ "ăn tối 30m" là BA MƯƠI PHÚT, không phải ba mươi triệu', () => {
    // Mira hiện thời lượng bằng chữ "m" ("20m · Cá nhân"), tức là app tự dạy người dùng
    // rằng m = phút. Bữa tối đo được cả tiền lẫn thời gian, nên ở đây "m" phải là phút.
    // Đọc nhầm thành 30 triệu là ghi một khoản chi gấp bảy lần thu nhập tháng.
    expect(doc('ăn tối 30m').yChi[0]).toMatchObject({
      kind: 'time',
      minutes: 30,
      bucket: 'family',
    });
  });

  it('nhóm nước đôi vẫn đọc tiền khi đơn vị rõ ràng', () => {
    expect(doc('ăn tối 400k').yChi[0]).toMatchObject({ kind: 'money', vnd: 400_000 });
    expect(doc('cà phê 35k').yChi[0]).toMatchObject({ kind: 'money', vnd: 35_000 });
    expect(doc('đi chợ 2 triệu').yChi[0]).toMatchObject({ kind: 'money', vnd: 2_000_000 });
  });

  it('⚑ "cà phê 45m" là bốn mươi lăm phút', () => {
    expect(doc('cà phê 45m').yChi[0]).toMatchObject({ kind: 'time', minutes: 45 });
  });
});

describe('parseByRules — danh mục tiền', () => {
  const DM_TIEN = [
    { id: 'mc-trua', name: 'Ăn trưa', cell: 'monthlyExpense' as const },
    { id: 'mc-trua-ct', name: 'Ăn trưa công ty', cell: 'monthlyExpense' as const },
    { id: 'mc-vang', name: 'Mua vàng', cell: 'investment' as const },
  ];
  const docT = (cau: string) =>
    parseByRules(cau, { today: TODAY, categories: [], moneyCategories: DM_TIEN });

  it('tên danh mục người dùng đặt thành từ khoá, và mang theo ô của nó', () => {
    expect(docT('ăn trưa 60k').yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      vnd: 60_000,
      categoryId: 'mc-trua',
      adds: true,
    });
    expect(docT('mua vàng 5tr').yChi[0]).toMatchObject({
      cell: 'investment',
      categoryId: 'mc-vang',
    });
  });

  it('⚑ tên DÀI NHẤT thắng', () => {
    // Khai cả "Ăn trưa" lẫn "Ăn trưa công ty" thì câu có cụm dài phải vào cụm dài. Lấy
    // cụm ngắn là mọi khoản dồn hết vào một danh mục, và cái kia không bao giờ dùng tới.
    expect(docT('ăn trưa công ty 80k').yChi[0]).toMatchObject({ categoryId: 'mc-trua-ct' });
  });

  it('⚑ danh mục tiền THẮNG từ khoá dựng sẵn', () => {
    // "mua vàng" trùng nhóm từ khoá đầu tư dựng sẵn. Chữ người dùng tự đặt phải thắng,
    // vì nó là tên họ chọn cho chính khoản ấy — và nó mang theo id để ghi vào danh mục.
    const y = docT('mua vàng 5tr').yChi[0] as { categoryId: string | null };
    expect(y.categoryId).toBe('mc-vang');
  });

  it('⚑ "ăn trưa 30m" vẫn là BA MƯƠI PHÚT', () => {
    // Danh mục tiền không được biến "m" thành triệu. "m" là chữ Mira dùng cho phút khắp
    // app, nên một khoản 30 triệu đẻ ra từ câu ghi giờ là sai kiểu không ai ngờ tới.
    expect(docT('ăn trưa 30m').yChi[0]).toMatchObject({ kind: 'time', minutes: 30 });
  });

  it('không khai danh mục tiền nào thì vẫn chạy bằng từ khoá dựng sẵn', () => {
    expect(doc('ăn tối 400k').yChi[0]).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      categoryId: null,
    });
  });

  it('⚑ ô MỨC không sinh khoản', () => {
    // Dư nợ là ảnh chụp, không cộng dồn. `adds: false` là thứ giữ cho "nợ 240 triệu"
    // khai hai lần không thành 480 triệu.
    expect(doc('dư nợ 240 triệu').yChi[0]).toMatchObject({ cell: 'debtBalance', adds: false });
    expect(doc('tài sản ròng 1,5 tỷ').yChi[0]).toMatchObject({ cell: 'netWorth', adds: false });
  });

  it('⚑ năm ô dòng chảy đều sinh khoản, có ngày', () => {
    for (const [cau, cell] of [
      ['lương 18 triệu', 'netIncome'],
      ['tiêu 350k', 'monthlyExpense'],
      ['đầu tư 2tr', 'investment'],
      ['lãng phí 300k', 'wastedMoney'],
      ['trả nợ 7tr', 'debtPayment'],
    ] as const) {
      expect(doc(cau).yChi[0]).toMatchObject({ cell, adds: true, date: TODAY });
    }
  });
});

describe('cách nói thường ngày: rưỡi, nửa tiếng, 1tr2', () => {
  const bc = { today: '2026-11-26', categories: [], moneyCategories: [] };
  const mot = (cau: string) => parseByRules(cau, bc).yChi[0];

  it('"2 triệu rưỡi" là 2,5 triệu, không phải 2 triệu', () => {
    expect(mot('tiền học con 2 triệu rưỡi')).toMatchObject({ kind: 'money', vnd: 2_500_000 });
  });

  it('"1 tiếng rưỡi" là 90 phút, và chữ "rưỡi" không lọt vào tên việc', () => {
    expect(mot('tối qua đá bóng 1 tiếng rưỡi')).toMatchObject({
      kind: 'time',
      minutes: 90,
      name: 'Đá bóng',
    });
  });

  it('"nửa tiếng" là 30 phút', () => {
    expect(mot('đọc sách nửa tiếng')).toMatchObject({
      kind: 'time',
      minutes: 30,
      name: 'Đọc sách',
    });
  });

  it('"1tr2" viết liền là 1,2 triệu', () => {
    expect(mot('đóng tiền điện 1tr2')).toMatchObject({ kind: 'money', vnd: 1_200_000 });
  });

  it('"7tr 2 tháng" có dấu cách thì vẫn là 7 triệu', () => {
    expect(mot('trả góp nhà 7tr 2 tháng')).toMatchObject({ kind: 'money', vnd: 7_000_000 });
  });

  it('gõ không dấu cũng nhận: "18 trieu ruoi", "nua tieng"', () => {
    expect(mot('luong thang nay 18 trieu ruoi')).toMatchObject({ kind: 'money', vnd: 18_500_000 });
    expect(mot('chay bo nua tieng')).toMatchObject({ kind: 'time', minutes: 30 });
  });
});

describe('câu mẫu làm quen 26/11: nợ trước chi tiêu, hạt ngày thường', () => {
  const bc = { today: '2026-11-26', categories: [], moneyCategories: [] };
  const mot = (cau: string) => parseByRules(cau, bc).yChi[0];

  // Chữ "mua" từng khớp trước chữ "nợ": một khoản nợ nhà 1 tỷ thành CHI TIÊU 1 tỷ.
  it('"còn nợ mua nhà 1 tỷ" là dư nợ, không phải chi tiêu', () => {
    expect(mot('còn nợ mua nhà 1 tỷ')).toMatchObject({
      kind: 'money',
      cell: 'debtBalance',
      vnd: 1_000_000_000,
    });
  });

  it('"trả góp mua xe 3tr" là trả nợ tháng', () => {
    expect(mot('trả góp mua xe 3tr')).toMatchObject({
      kind: 'money',
      cell: 'debtPayment',
      vnd: 3_000_000,
    });
  });

  it('"nợ thẻ tín dụng 15 triệu" là dư nợ', () => {
    expect(mot('nợ thẻ tín dụng 15 triệu')).toMatchObject({ kind: 'money', cell: 'debtBalance' });
  });

  it('chi tiêu thường vẫn là chi tiêu', () => {
    expect(mot('mua áo 350k')).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      vnd: 350_000,
    });
  });

  it('"được sếp khen" là kẹo, "kẹt xe cả tiếng" là muối', () => {
    expect(mot('được sếp khen')).toMatchObject({ kind: 'grain', grain: 'candy' });
    expect(mot('kẹt xe cả tiếng')).toMatchObject({ kind: 'grain', grain: 'salt' });
  });

  it('"gọi cho mẹ 20 phút" là giờ gia đình', () => {
    expect(mot('gọi cho mẹ 20 phút')).toMatchObject({
      kind: 'time',
      bucket: 'family',
      minutes: 20,
    });
  });
});

describe('bốn câu còn hỏng trong audit 26/11', () => {
  const bc = { today: '2026-11-26', categories: [], moneyCategories: [] };
  const mot = (cau: string) => parseByRules(cau, bc).yChi[0];

  it('"nhậu với bạn 400k" là chi tiêu', () => {
    expect(mot('nhậu với bạn 400k')).toMatchObject({
      kind: 'money',
      cell: 'monthlyExpense',
      vnd: 400_000,
    });
  });

  it('"mẹ cho 2 triệu" là thu nhập', () => {
    expect(mot('mẹ cho 2 triệu')).toMatchObject({
      kind: 'money',
      cell: 'netIncome',
      vnd: 2_000_000,
    });
  });

  it('"hôm qua tăng ca 3 tiếng" là giờ công việc, không phải đoán', () => {
    expect(mot('hôm qua tăng ca 3 tiếng')).toMatchObject({
      kind: 'time',
      bucket: 'work',
      minutes: 180,
      bucketGuessed: false,
    });
  });

  it('câu ghép "sáng họp 2 tiếng, trưa ăn 50k, tối chơi với con 1 tiếng" ghi đủ ba ý', () => {
    const y = parseByRules('sáng họp 2 tiếng, trưa ăn 50k, tối chơi với con 1 tiếng', bc).yChi;
    expect(y.map((x) => x.kind)).toEqual(['time', 'money', 'time']);
  });

  it('"cãi nhau với vợ" vẫn là hạt muối, không thành chi tiêu', () => {
    expect(mot('cãi nhau với vợ')).toMatchObject({ kind: 'grain', grain: 'salt' });
  });

  it('"mẹ cho con ăn 30 phút" vẫn là giờ, không thành thu nhập', () => {
    expect(mot('cho con ăn 30 phút')).toMatchObject({ kind: 'time', bucket: 'family' });
  });
});

describe('câu mẫu ở dải Lãng phí trống', () => {
  // Dải Lãng phí (Thời gian và Tài chính) dạy người mới bằng hai câu này. Câu dạy mà đọc sai
  // thì người mới học sai ngay từ câu đầu.
  it('"lướt điện thoại 1 tiếng" là 60 phút lãng phí', () => {
    expect(doc('lướt điện thoại 1 tiếng').yChi[0]).toMatchObject({
      kind: 'time',
      bucket: 'waste',
      minutes: 60,
    });
  });

  it('"lãng phí 200k" là 200 nghìn tiền lãng phí', () => {
    expect(doc('lãng phí 200k').yChi[0]).toMatchObject({ cell: 'wastedMoney', vnd: 200_000 });
  });
});
