import { describe, it, expect } from 'vitest';
import type { TimeEntry } from '@mira/contract';
import { gomMuc, laNhom, nhipCua, type NhomMuc } from '../gom';

let dem = 0;
const muc = (
  date: string,
  minutes: number,
  note: string | null = 'Ăn tối',
  bucket: TimeEntry['bucket'] = 'personal',
  golden = false,
): TimeEntry => ({ id: `e${(dem += 1)}`, date, minutes, bucket, golden, note, source: 'manual' });

const ngay = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;

describe('gomMuc', () => {
  it('hai lần chưa phải nếp, giữ nguyên hai dòng', () => {
    const ra = gomMuc([muc(ngay(24), 30), muc(ngay(25), 30)]);
    expect(ra).toHaveLength(2);
    expect(ra.every((x) => !laNhom(x))).toBe(true);
  });

  it('ba lần trở lên thì gom thành một dòng', () => {
    const ra = gomMuc([muc(ngay(23), 30), muc(ngay(24), 30), muc(ngay(25), 30)]);
    expect(ra).toHaveLength(1);
    const n = ra[0] as NhomMuc;
    expect(laNhom(n)).toBe(true);
    expect(n.soLan).toBe(3);
    expect(n.phutThuong).toBe(30);
    expect(n.tuNgay).toBe(ngay(23));
    expect(n.denNgay).toBe(ngay(25));
    expect(n.tongPhut).toBe(90);
  });

  it('gom theo VIỆC, không theo số phút, nên ngày lệch vẫn nằm trong nhóm', () => {
    // Đây là chỗ quan trọng nhất. Gom theo số phút thì ngày 45 phút rơi ra ngoài và
    // nằm lẫn trong danh sách, đúng lúc nó là ngày đáng nói nhất.
    const ra = gomMuc([muc(ngay(22), 30), muc(ngay(23), 30), muc(ngay(24), 30), muc(ngay(25), 45)]);
    expect(ra).toHaveLength(1);
    const n = ra[0] as NhomMuc;
    expect(n.soLan).toBe(4);
    expect(n.phutThuong).toBe(30);
    expect(n.ngayKhac).toHaveLength(1);
    expect(n.ngayKhac[0]?.minutes).toBe(45);
  });

  it('nếp đều tăm tắp thì không có ngày nào khác', () => {
    const ra = gomMuc([muc(ngay(23), 30), muc(ngay(24), 30), muc(ngay(25), 30)]);
    expect((ra[0] as NhomMuc).ngayKhac).toHaveLength(0);
    expect((ra[0] as NhomMuc).deu).toBe(true);
  });

  it('vài ngày lệch thì vẫn là nếp cứng', () => {
    // 1 trên 6 ngày lệch: vẫn có một con số chuẩn để mà lệch khỏi nó.
    const ra = gomMuc([
      muc(ngay(20), 30),
      muc(ngay(21), 30),
      muc(ngay(22), 30),
      muc(ngay(23), 30),
      muc(ngay(24), 30),
      muc(ngay(25), 90),
    ]);
    const n = ra[0] as NhomMuc;
    expect(n.deu).toBe(true);
    expect(n.phutThuong).toBe(30);
    expect(n.ngayKhac).toHaveLength(1);
  });

  it('phần lớn ngày khác nhau thì là nếp MỀM, không có chuẩn nào cả', () => {
    // Lỗi thật gặp ngày 25/11/2026: màn Lãng phí báo "17 ngày không theo nếp" trên 24
    // ngày. Nhiều đến thế thì cái gọi là chuẩn chỉ là số hay gặp nhất trong một đống
    // số khác nhau, và bày nó ra như một chuẩn là bịa ra nếp không có thật.
    const ra = gomMuc([
      muc(ngay(20), 168, 'Điện thoại'),
      muc(ngay(21), 186, 'Điện thoại'),
      muc(ngay(22), 318, 'Điện thoại'),
      muc(ngay(23), 186, 'Điện thoại'),
      muc(ngay(24), 275, 'Điện thoại'),
      muc(ngay(25), 306, 'Điện thoại'),
    ]);
    const n = ra[0] as NhomMuc;
    expect(n.deu).toBe(false);
    expect(n.phutNhoNhat).toBe(168);
    expect(n.phutLonNhat).toBe(318);
    expect(n.phutTrungBinh).toBe(240);
  });

  it('khoảng và trung bình tính đúng cả khi nếp cứng', () => {
    const ra = gomMuc([muc(ngay(23), 30), muc(ngay(24), 30), muc(ngay(25), 60)]);
    const n = ra[0] as NhomMuc;
    expect(n.phutNhoNhat).toBe(30);
    expect(n.phutLonNhat).toBe(60);
    expect(n.phutTrungBinh).toBe(40);
  });

  it('giờ vàng và không giờ vàng là hai nhóm khác nhau', () => {
    const ra = gomMuc([
      muc(ngay(21), 60, 'Chơi với con', 'family', true),
      muc(ngay(22), 60, 'Chơi với con', 'family', true),
      muc(ngay(23), 60, 'Chơi với con', 'family', true),
      muc(ngay(24), 60, 'Chơi với con', 'family', false),
      muc(ngay(25), 60, 'Chơi với con', 'family', false),
    ]);
    expect(ra.filter(laNhom)).toHaveLength(1);
    expect(ra.filter((x) => !laNhom(x))).toHaveLength(2);
  });

  it('ghi chú khác nhau thì không gom lẫn', () => {
    const ra = gomMuc([
      muc(ngay(23), 30, 'Ăn tối'),
      muc(ngay(24), 30, 'Ăn tối'),
      muc(ngay(25), 30, 'Ăn tối'),
      muc(ngay(23), 30, 'Nhà cửa'),
      muc(ngay(24), 30, 'Nhà cửa'),
      muc(ngay(25), 30, 'Nhà cửa'),
    ]);
    expect(ra).toHaveLength(2);
    expect(ra.filter(laNhom)).toHaveLength(2);
  });

  it('ghi chú chỉ khác hoa thường hoặc khoảng trắng vẫn là một nhóm', () => {
    const ra = gomMuc([muc(ngay(23), 30, 'Ăn tối'), muc(ngay(24), 30, ' ăn tối '), muc(ngay(25), 30, 'ĂN TỐI')]);
    expect(ra).toHaveLength(1);
    expect((ra[0] as NhomMuc).soLan).toBe(3);
  });

  it('mục không ghi chú vẫn gom được với nhau', () => {
    const ra = gomMuc([muc(ngay(23), 60, null), muc(ngay(24), 60, null), muc(ngay(25), 60, null)]);
    expect((ra[0] as NhomMuc).soLan).toBe(3);
    expect((ra[0] as NhomMuc).note).toBe('');
  });

  it('xếp theo ngày mới nhất, dòng gom không nhảy lên đầu vì gom nhiều', () => {
    const ra = gomMuc([
      muc(ngay(10), 30, 'Cũ'),
      muc(ngay(11), 30, 'Cũ'),
      muc(ngay(12), 30, 'Cũ'),
      muc(ngay(25), 90, 'Mới'),
    ]);
    expect(laNhom(ra[0] as never)).toBe(false);
    expect((ra[0] as TimeEntry).note).toBe('Mới');
  });

  it('hoà số lần thì lấy số phút nhỏ hơn, để kết quả không đổi theo thứ tự nạp', () => {
    const xuoi = gomMuc([muc(ngay(23), 30), muc(ngay(24), 45), muc(ngay(25), 60)]);
    const nguoc = gomMuc([muc(ngay(25), 60), muc(ngay(24), 45), muc(ngay(23), 30)]);
    expect((xuoi[0] as NhomMuc).phutThuong).toBe(30);
    expect((nguoc[0] as NhomMuc).phutThuong).toBe(30);
  });
});

describe('nhipCua', () => {
  const nhom = (soLan: number, tuNgay: string, denNgay: string): NhomMuc => ({
    bucket: 'personal',
    note: 'Ăn tối',
    golden: false,
    deu: true,
    phutThuong: 30,
    phutNhoNhat: 30,
    phutLonNhat: 30,
    phutTrungBinh: 30,
    soLan,
    tuNgay,
    denNgay,
    tongPhut: soLan * 30,
    ngayKhac: [],
    muc: [],
  });

  it('phủ kín khoảng thì nói "mỗi ngày"', () => {
    expect(nhipCua(nhom(28, '2026-10-29', '2026-11-25'))).toBe('mỗi ngày');
  });

  it('thiếu một hai ngày thì vẫn là "gần như mỗi ngày"', () => {
    expect(nhipCua(nhom(26, '2026-10-29', '2026-11-25'))).toBe('gần như mỗi ngày');
  });

  it('thưa hơn thì nói rõ bao nhiêu trên bao nhiêu', () => {
    expect(nhipCua(nhom(8, '2026-10-29', '2026-11-25'))).toBe('8 trong 28 ngày');
  });
});
