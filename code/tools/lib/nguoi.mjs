/**
 * Mô hình một con người có tính cách, có trạng thái mang sang ngày hôm sau, có sự kiện đời,
 * và có phản ứng với việc dùng app.
 *
 * Khác mô hình cũ (`dan-so.mjs`) ở bốn chỗ — và cả bốn đều là lý do mô hình cũ cho ra một
 * cuộc đời phẳng lì:
 *   1. Tính cách: năm nét, rút một lần, ảnh hưởng suốt sáu tháng.
 *   2. Trạng thái ngày: năng lượng và căng thẳng kéo sang hôm sau (AR(1)), không rút lại từ đầu.
 *   3. Sự kiện đời: dự án gấp, ốm, con ốm, thưởng, mất khách, du lịch — có thời lượng, có dư âm.
 *   4. Vòng lặp với app: ghi hay không ghi, bỏ lúc nào, và nếu còn ghi thì hành vi đổi bao nhiêu.
 *
 * HỆ SỐ TÁC ĐỘNG CỦA APP LẤY TỪ TÀI LIỆU, KHÔNG BỊA:
 *   - Theo dõi tiến độ: d ≈ 0,40 (Harkin 2016, N-202)
 *   - Kế hoạch nếu–thì, tức luật khai nguồn: d ≈ 0,65 (Gollwitzer & Sheeran 2006, N-201)
 *   Quy sang phần trăm: d là đơn vị độ lệch chuẩn; độ lệch chuẩn giờ lãng phí trong một
 *   người ≈ 20% trung bình, nên d = 0,40 → giảm ~8%, d = 0,65 → giảm ~13%.
 *   Nghĩa là mô phỏng này trả lời: *nếu các hệ số trong tài liệu đúng, sáu tháng trông thế nào*.
 *   Nó KHÔNG chứng minh app có tác dụng.
 */

export const WEEKS = 26;
export const DAYS = WEEKS * 7;

export function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const between = (r, lo, hi) => lo + r() * (hi - lo);
/** Phân phối chuông thô bằng trung bình ba lần rút — đủ cho tính cách. */
const bell = (r) => (r() + r() + r()) / 3;

// ─────────────────────────────────────────────────────── tính cách

/**
 * Năm nét. Mỗi nét 0–1, rút từ phân phối chuông nên phần lớn người ở giữa.
 *   kyLuat      giữ được việc đã định, kể cả khi không thích
 *   bocDong     với lấy điện thoại khi trống, khó dừng
 *   loAu        căng thẳng bám lâu, ngủ kém sau ngày xấu
 *   ganKet      coi trọng người thân, chủ động dành giờ
 *   toMo        thích nhìn số về chính mình — nét quyết định có mở app lần thứ hai không
 */
export function traits(r) {
  const kyLuat = clamp01(bell(r) * 1.1 - 0.05);
  return {
    kyLuat,
    // Bốc đồng nghịch với kỷ luật nhưng không phải đối lập hoàn toàn.
    bocDong: clamp01(1 - kyLuat * 0.65 + (bell(r) - 0.5) * 0.5),
    loAu: clamp01(bell(r)),
    ganKet: clamp01(bell(r)),
    toMo: clamp01(bell(r)),
  };
}

// ─────────────────────────────────────────────────────── sự kiện đời

/**
 * Mỗi sự kiện: xác suất mỗi tháng, số ngày kéo dài, và hệ số nhân lên từng nhóm giờ.
 * `thu` là hệ số nhân thu nhập tháng đó.
 */
const EVENTS = [
  { key: 'du-an-gap', ten: 'Dự án gấp', p: 0.5, ngay: 11, work: 1.4, family: 0.55, waste: 0.85, cangThang: 0.35 },
  { key: 'om', ten: 'Ốm', p: 0.35, ngay: 5, work: 0.35, family: 0.8, waste: 1.5, cangThang: 0.2 },
  { key: 'con-om', ten: 'Con ốm', p: 0.45, ngay: 4, work: 0.7, family: 1.7, waste: 0.7, cangThang: 0.4, canCon: true },
  { key: 'nguoi-than-om', ten: 'Người thân ốm', p: 0.14, ngay: 12, work: 0.85, family: 1.4, waste: 0.9, cangThang: 0.55 },
  { key: 'du-lich', ten: 'Đi chơi xa', p: 0.22, ngay: 4, work: 0.15, family: 1.9, waste: 1.2, cangThang: -0.3 },
  { key: 'thuong', ten: 'Được thưởng', p: 0.16, ngay: 2, work: 1, family: 1, waste: 1, cangThang: -0.2, thu: 1.9 },
  { key: 'mat-khach', ten: 'Mất khách / cắt giờ', p: 0.07, ngay: 30, work: 0.7, family: 1.1, waste: 1.25, cangThang: 0.6, thu: 0.55 },
  { key: 'cang-thang-nha', ten: 'Căng thẳng trong nhà', p: 0.18, ngay: 14, work: 1.05, family: 0.6, waste: 1.3, cangThang: 0.5 },
];

function sinhSuKien(r, hasCon) {
  const out = [];
  for (let m = 0; m < 6; m += 1) {
    for (const e of EVENTS) {
      if (e.canCon && !hasCon) continue;
      if (r() < e.p) {
        out.push({ ...e, batDau: m * 30 + Math.floor(r() * 26) });
      }
    }
  }
  return out;
}

const dangDienRa = (events, d) => events.filter((e) => d >= e.batDau && d < e.batDau + e.ngay);

// ─────────────────────────────────────────────────────── một cuộc đời sáu tháng

/**
 * @param job   từ lib/dan-so.mjs — nhịp giờ cơ bản và ma sát ghi chép của nghề
 * @param stage giai đoạn sống — giờ gia đình cơ bản
 * @param city  hệ số thu nhập / chi tiêu theo vùng
 * @param dungApp true = có cài Mira, false = nhóm đối chứng không cài
 */
/**
 * @param tuyChon các can thiệp cần thử. Mặc định rỗng = bản hiện tại.
 *   giamMaSat  0..1 — giảm ma sát ghi chép bao nhiêu phần (gợi ý theo nếp, một chạm xác nhận)
 *   epMucTieu  0..1 — xác suất người dùng có mục tiêu kèm khai nguồn, thay cho mặc định
 *                     phụ thuộc kỷ luật. Đưa việc đặt mục tiêu vào luồng mở tài khoản.
 *   giuMoiMe   ≥1   — kéo dài thời gian trước khi hết hào hứng (hạt cũ nổi lên, so theo mùa)
 *   nhacTuan   bool — một nhắc nhẹ khi đã bốn ngày không ghi
 *
 * Số lần gọi r() phải giữ nguyên giữa các kịch bản, nếu không chuỗi ngẫu nhiên lệch đi và
 * hai kịch bản không còn so với nhau được nữa.
 */
export function songSauThang({ seed, job, stage, city, dungApp, tuyChon = {} }) {
  const giamMaSat = tuyChon.giamMaSat ?? 0;
  const nhacTuan = tuyChon.nhacTuan ?? false;
  /**
   * `nhatKy` = người vốn đã có thói quen ghi chép hằng ngày (nhật ký, bullet journal,
   * sổ tay). Họ khác dân số chung ở bốn chỗ, và cả bốn đều là hệ quả của cùng một điều:
   * phần chi phí mà mọi phân tích chỉ ra là chỗ thắt thì họ đã trả trước rồi.
   *   - Tò mò về chính mình cao hẳn — đó là nét định nghĩa nhóm này
   *   - Ma sát nghề bớt cản, vì họ ghi bất kể đang làm nghề gì
   *   - Hào hứng nhạt chậm hơn nhiều: cái giữ họ lại là thói quen, không phải cái mới
   *   - Bỏ hạt vào hũ thường xuyên hơn hẳn — họ vốn là người viết
   */
  const nhatKy = tuyChon.nhatKy ?? false;
  const giuMoiMe = (tuyChon.giuMoiMe ?? 1) * (nhatKy ? 2.2 : 1);
  const r = rng(seed);
  // Dòng ngẫu nhiên riêng cho hũ khoảnh khắc: thêm vào sau nên phải tách ra, nếu không
  // chuỗi chính lệch đi và mọi con số đã báo cáo trước đó không so lại được.
  const rHu = rng(seed ^ 0x5bf03635);
  const t = traits(r);
  if (nhatKy) {
    t.toMo = 0.55 + t.toMo * 0.45;
    t.kyLuat = clamp01(t.kyLuat * 0.82 + 0.18);
  }
  const hasCon = stage.key === 'con-nho' || stage.key === 'con-lon';
  const events = sinhSuKien(r, hasCon);

  // Thu nhập: mức nền theo nghề và vùng, cộng khả năng tăng lương giữa kỳ.
  const thuNen = between(r, job.income[0], job.income[1]) * city.incomeMul * 1e6;
  const thangTangLuong = r() < 0.22 ? 2 + Math.floor(r() * 3) : null;
  const mucTangLuong = between(r, 0.08, 0.22);

  const chiNen = thuNen * between(r, stage.expense[0], stage.expense[1]) * city.expenseMul;
  const coNo = r() < stage.debt && job.key !== 'sinhvien';
  const traNo = coNo ? Math.round(thuNen * between(r, 0.14, 0.3)) : null;
  const duNo0 = coNo ? Math.round(traNo * between(r, 26, 150)) : null;

  // Trạng thái mang sang ngày hôm sau.
  let nangLuong = 0.6, cangThang = 0.25 + t.loAu * 0.2;

  // Vòng lặp với app.
  let dangDung = dungApp;
  let ngayKhongGhi = 0, tuanGhiDu = 0, soNgayGhi = 0;
  let boTuan = null;
  // Hiệu lực tích luỹ của app: tăng dần khi còn ghi, tan dần khi bỏ.
  let hieuLuc = 0;
  // Có đặt mục tiêu kèm khai nguồn không — quyết định dùng hệ số 0,65 hay 0,40.
  const rollMucTieu = r(); // luôn rút, kể cả khi không dùng app, để giữ chuỗi thẳng hàng
  const pMucTieu = tuyChon.epMucTieu ?? 0.35 + t.kyLuat * 0.4;
  const coMucTieu = dungApp && rollMucTieu < pMucTieu;

  const moments = [];
  const tuan = [];
  let w = { waste: 0, family: 0, golden: 0, work: 0, personal: 0, ghi: 0 };
  const thang = [];
  let m = { thu: 0, ngay: 0 };

  for (let d = 0; d < DAYS; d += 1) {
    const wd = d % 7;
    const cuoiTuan = wd >= 5;
    const i = cuoiTuan ? 1 : 0;
    const dom = (d % 30) + 1;
    const peak = job.peak[0] > 0 && (dom > 30 - job.peak[0] || dom <= 2);
    const ev = dangDienRa(events, d);
    const nhan = (field) => ev.reduce((a, e) => a * (e[field] ?? 1), 1);

    // ── trạng thái
    const apLuc = (peak ? 0.2 : 0) + ev.reduce((a, e) => a + (e.cangThang ?? 0), 0);
    cangThang = clamp01(cangThang * (0.72 + t.loAu * 0.16) + apLuc * 0.5 + (bell(r) - 0.5) * 0.12);
    nangLuong = clamp01(nangLuong * 0.68 + (0.62 - cangThang * 0.45) * 0.32 + (bell(r) - 0.5) * 0.16);

    // ── giờ
    let work = job.work[i] * (peak ? job.peak[1] : 1) * nhan('work') * (0.85 + nangLuong * 0.3);

    // Lãng phí: bốc đồng đẩy lên, căng thẳng đẩy lên mạnh hơn, năng lượng thấp đẩy lên.
    // Đây là chỗ app tác động, và chỉ tác động khi người ta còn ghi.
    let waste =
      job.waste[i] *
      (0.75 + t.bocDong * 0.7) *
      (1 + cangThang * 0.55) *
      (1.25 - nangLuong * 0.4) *
      nhan('waste') *
      (1 - hieuLuc);

    let family =
      stage.family[i] * (0.7 + t.ganKet * 0.6) * (peak ? 0.6 : 1) * nhan('family') *
      (1 + hieuLuc * 0.45);

    const personal = job.personal[i] * (0.8 + t.kyLuat * 0.4) * (1 - cangThang * 0.25);

    // Giờ vàng: có mặt bằng người thì dễ, có mặt bằng đầu thì khó — căng thẳng ăn vào đây.
    const tyLeVang = clamp01(stage.golden * (0.75 + t.ganKet * 0.4) * (1 - cangThang * 0.45));
    const golden = family * tyLeVang;

    work = Math.max(0, Math.round(work * (0.85 + bell(r) * 0.3)));
    waste = Math.max(0, Math.round(waste * (0.8 + bell(r) * 0.4)));
    family = Math.max(0, Math.round(family * (0.75 + bell(r) * 0.5)));

    // ── ghi hay không
    let ghiHomNay = false;
    if (dangDung) {
      // Mới dùng thì hăng, về sau nhạt dần (N-208). Kỷ luật và tò mò giữ lại.
      const tuanThu = Math.floor(d / 7);
      const nhietBanDau = Math.exp(-tuanThu / ((6 + t.toMo * 14) * giuMoiMe));
      const pGhi = clamp01(
        (0.22 + t.kyLuat * 0.45 + t.toMo * 0.25) * (0.45 + nhietBanDau * 0.55) *
          (1 - job.friction * (1 - giamMaSat) * (nhatKy ? 0.45 : 1) * 0.55) *
          (1 - cangThang * 0.3) *
          // Nhắc chỉ có tác dụng khi người ta đã trượt vài ngày, và chỉ nhẹ.
          (nhacTuan && ngayKhongGhi >= 4 ? 1.35 : 1),
      );
      ghiHomNay = r() < pGhi;
      if (ghiHomNay) { soNgayGhi += 1; ngayKhongGhi = 0; } else { ngayKhongGhi += 1; }
      // Bỏ hẳn sau 12 ngày liền không ghi.
      if (ngayKhongGhi >= 12) { dangDung = false; boTuan = Math.floor(d / 7); }
    }

    // ── hiệu lực của app
    // Chỉ tăng khi tuần trước ghi đủ. Hệ số trần lấy từ tài liệu (xem đầu file).
    const tran = coMucTieu ? 0.13 : 0.08;
    if (dangDung && tuanGhiDu >= 1) {
      hieuLuc = Math.min(tran, hieuLuc + tran / 70);
    } else if (!dangDung) {
      hieuLuc = Math.max(0, hieuLuc - tran / 45);
    }

    // Hũ chỉ nhận hạt vào ngày người ta còn mở app. Ngày căng thẳng cao thì phần lớn là
    // hạt muối — đây là chỗ duy nhất Mira nghe được bằng lời chứ không bằng số.
    if (ghiHomNay && rHu() < (0.17 + t.ganKet * 0.12) * (nhatKy ? 2.6 : 1)) {
      const pMuoi = clamp01(0.12 + cangThang * 0.72 - nangLuong * 0.18);
      moments.push({ ngay: d, tuan: Math.floor(d / 7), muoi: rHu() < pMuoi });
    }

    w.work += work; w.waste += waste; w.family += family; w.golden += golden;
    w.personal += personal; w.ghi += ghiHomNay ? 1 : 0;

    const thangIndex = Math.floor(d / 30);
    const heSoThu =
      (thangTangLuong !== null && thangIndex >= thangTangLuong ? 1 + mucTangLuong : 1) * nhan('thu');
    m.thu += (thuNen * heSoThu) / 30;
    m.ngay += 1;

    if (wd === 6) {
      tuanGhiDu = w.ghi >= 4 ? tuanGhiDu + 1 : 0;
      tuan.push({
        work: w.work, waste: w.waste, family: w.family, golden: Math.round(w.golden),
        personal: Math.round(w.personal), daysLogged: w.ghi, dangDung, hieuLuc, cangThang,
      });
      w = { waste: 0, family: 0, golden: 0, work: 0, personal: 0, ghi: 0 };
    }
    if (m.ngay === 30) {
      thang.push({ thu: Math.round(m.thu), chi: Math.round(chiNen), traNo });
      m = { thu: 0, ngay: 0 };
    }
  }

  return {
    job, stage, city, traits: t, events, dungApp, coMucTieu, nhatKy,
    boTuan, soNgayGhi, tuan, thang, moments,
    thuNen, chiNen, coNo, traNo, duNo0, thangTangLuong,
    hieuLucCuoi: hieuLuc,
  };
}
