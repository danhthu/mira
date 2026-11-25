import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BUCKET_LABEL_VI,
  O_TIEN_LABEL_VI,
  type KetQuaDoc,
  type MoneyMonthUpdate,
  type YChi,
} from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { goiYNhanh, type GoiNhanh } from '../../lib/goiY';
import { addDays, labelDay, monthOf, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, months as fmtMonths, vnd, UNKNOWN } from '../../lib/format';
import './Chat.css';

/**
 * Màn Nhật ký, dạng chat.
 *
 * VÌ SAO ĐỔI. Đếm trên bản cũ (`docs/10-kich-ban-khai-va-ghi.md`): 54 thao tác trước khi
 * thấy con số đầu tiên, 11 thao tác mỗi ngày, và phải hiểu bốn khái niệm (ô, danh mục,
 * giờ vàng, thứ trong tuần) mới khai được một nếp. Ba chỗ hỏng đó có chung một gốc:
 * người dùng phải dịch đời mình sang mô hình dữ liệu của Mira.
 *
 * Một dòng chat đảo chiều dịch đó. Ô và danh mục trở thành thứ Mira suy ra, không phải
 * thứ người dùng phải khai.
 *
 * LUẬT CỨNG: KHÔNG BAO GIỜ TỰ GHI. Mira đọc câu, đề xuất, người dùng bấm "Ghi" rồi mới
 * ghi. Và đường ghi vẫn là các route cũ đã kiểm, không có cửa sau nào mới. Một dòng bịa
 * làm hỏng niềm tin vào cả trăm dòng thật.
 */
interface Dong {
  readonly id: number;
  readonly ai: 'toi' | 'mira';
  readonly chu?: string;
  readonly ketQua?: KetQuaDoc;
  readonly daGhi?: boolean;
  /** Đang ghi: hiện "Đang ghi…" chứ không hiện nút gì. */
  readonly dangGhi?: boolean;
  /** Đủ thông tin để gỡ lại đúng những gì vừa ghi. */
  readonly veT?: VetGhi;
  readonly daHoanTac?: boolean;
  /** Ghi hỏng giữa chừng thì phải nói ra, không được im. */
  readonly loiGhi?: string;
}

/**
 * Vết của một lần ghi, để hoàn tác.
 *
 * Mục giờ và hạt gỡ bằng id. Ô tiền thì **không có id để xoá** — nó là một con số của cả
 * tháng — nên phải chụp lại giá trị cũ trước khi đổi rồi đặt về đúng cái đó.
 */
interface VetGhi {
  readonly gio: string[];
  readonly hat: string[];
  readonly tien: { readonly thang: string; readonly truoc: MoneyMonthUpdate }[];
}

/** Khoảng ngày dùng để rút phím Ghi nhanh. Hai tuần: đủ thấy nếp, chưa kịp nguội. */
const NGAY_XET_GOI = 14;

let demDong = 0;

export function ChatScreen() {
  const day = today();
  const [dong, setDong] = useState<Dong[]>([]);
  const [cau, setCau] = useState('');
  const [dangDoc, setDangDoc] = useState(false);
  const duoi = useRef<HTMLDivElement>(null);

  const tomTat = useAsync(async () => {
    const [summary, money, ganDay] = await Promise.all([
      store.weekSummary(weekStartOf(day)),
      store.getMoney(monthOf(day)),
      // Hai tuần đổ lại, để rút phím Ghi nhanh. Lấy cả đời thì phím tắt đóng băng theo
      // thói quen năm ngoái, mà việc của màn này là ghi chuyện hôm nay.
      store.listTimeEntries(addDays(day, -NGAY_XET_GOI), day),
    ]);
    return { summary, money, goi: goiYNhanh(ganDay) };
  }, [day]);

  useEffect(() => {
    duoi.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dong]);

  async function gui(): Promise<void> {
    const text = cau.trim();
    if (text === '' || dangDoc) return;
    setCau('');
    setDong((d) => [...d, { id: (demDong += 1), ai: 'toi', chu: text }]);
    setDangDoc(true);
    try {
      const ketQua = await store.doc(text, day);
      const id = (demDong += 1);
      const coGhiDuoc = ketQua.yChi.some(
        (y) => y.loai === 'gio' || y.loai === 'hat' || y.loai === 'tien',
      );
      setDong((d) => [...d, { id, ai: 'mira', ketQua, dangGhi: coGhiDuoc }]);
      // Ghi ngay, không chờ bấm nút. Đổi lại phải có đường gỡ: xem `ghi`.
      if (coGhiDuoc) void ghi(id, ketQua.yChi);
    } catch (cause: unknown) {
      setDong((d) => [
        ...d,
        {
          id: (demDong += 1),
          ai: 'mira',
          chu: cause instanceof Error ? cause.message : 'Không đọc được câu này.',
        },
      ]);
    } finally {
      setDangDoc(false);
    }
  }

  /**
   * Ghi theo **ngày của từng ý chí**, không phải hôm nay.
   *
   * "hôm qua ngủ 7 tiếng" trước đây ghi vào hôm nay: đúng số phút, sai ngày, và không có
   * chỗ nào trên giao diện báo. Giờ máy chủ trả `ngay` kèm mỗi mục và client ghi đúng
   * cái đó. Danh mục cũng vậy — khớp được thì mục giờ ra đã phân loại.
   */
  async function ghi(id: number, yChi: readonly YChi[]): Promise<void> {
    const veT: VetGhi = { gio: [], hat: [], tien: [] };
    try {
      for (const y of yChi) {
        if (y.loai === 'gio') {
          const ra = await store.createTimeEntry({
            date: y.ngay,
            minutes: y.minutes,
            bucket: y.bucket,
            golden: y.golden,
            note: y.danhMucId === null ? y.ten : null,
            danhMucId: y.danhMucId,
          });
          veT.gio.push(ra.id);
        } else if (y.loai === 'hat') {
          const ra = await store.createMoment({ date: y.ngay, kind: y.kind, text: y.text });
          veT.hat.push(ra.id);
        } else if (y.loai === 'tien') {
          // Đọc trước khi ghi: vừa để cộng dồn, vừa để giữ giá trị cũ cho nút Hoàn tác.
          const hienCo = (await store.getMoney(y.thang)).month;
          const cu = hienCo[y.o];
          veT.tien.push({ thang: y.thang, truoc: { [y.o]: cu } });
          await store.saveMoney(y.thang, { [y.o]: y.cong ? (cu ?? 0) + y.vnd : y.vnd });
        }
      }
      setDong((d) => d.map((x) => (x.id === id ? { ...x, daGhi: true, dangGhi: false, veT } : x)));
    } catch (cause: unknown) {
      // Hỏng giữa chừng: phần đã ghi vẫn còn, nên phải nói ra và vẫn cho gỡ phần đó.
      setDong((d) =>
        d.map((x) =>
          x.id === id
            ? {
                ...x,
                dangGhi: false,
                daGhi: true,
                veT,
                loiGhi: cause instanceof Error ? cause.message : 'Ghi hỏng giữa chừng.',
              }
            : x,
        ),
      );
    }
    tomTat.reload();
  }

  /**
   * Chạm một phím Ghi nhanh là ghi luôn.
   *
   * Không đẩy chữ vào ô gõ rồi bắt bấm Gửi: như thế vẫn là hai thao tác cộng một lần đọc
   * lại, tức là chẳng tiết kiệm gì. Nó đi thẳng qua đúng đường mà câu chat đi, nên cũng
   * có đúng nút Hoàn tác ấy — đó là chỗ gánh rủi ro chạm nhầm.
   */
  async function ghiNhanh(g: GoiNhanh): Promise<void> {
    const y: YChi = {
      loai: 'gio',
      bucket: g.bucket,
      minutes: g.minutes,
      ten: g.nhan,
      golden: g.golden,
      ngay: day,
      danhMucId: g.danhMucId,
    };
    const id = (demDong += 1);
    setDong((d) => [
      ...d,
      { id, ai: 'mira', ketQua: { yChi: [y], nguon: 'luat' }, dangGhi: true },
    ]);
    await ghi(id, [y]);
  }

  /**
   * Gỡ lại đúng những gì vừa ghi.
   *
   * Không có nút này thì "tự động ghi" là máy viết vào nhật ký của người mà người không
   * cản được. Founder nói "auto ghi, người dùng reject nếu không đạt" — muốn reject thì
   * phải có đường gỡ, nếu không thì nửa sau câu đó không tồn tại.
   */
  async function hoanTac(id: number, veT: VetGhi): Promise<void> {
    for (const gioId of veT.gio) await store.deleteTimeEntry(gioId);
    for (const hatId of veT.hat) await store.deleteMoment(hatId);
    for (const t of veT.tien) await store.saveMoney(t.thang, t.truoc);
    setDong((d) => d.map((x) => (x.id === id ? { ...x, daHoanTac: true } : x)));
    tomTat.reload();
  }

  const summary = tomTat.data?.summary ?? null;
  const derived = tomTat.data?.money.derived ?? null;
  const waste = summary?.slices.find((s) => s.bucket === 'waste') ?? null;
  const goi = tomTat.data?.goi ?? [];

  /**
   * Chênh giờ vàng so tuần trước.
   *
   * `previous` đã là **null khi không so được** — tuần trước trống, hoặc tuần này ghi ít
   * ngày hơn. Máy chủ giữ chốt đó, client không được tự nối lại: so tổng 3 ngày với tổng
   * 7 ngày thì cái gì cũng "giảm", và Mira từng báo "lãng phí giảm 26h" đúng kiểu đó.
   */
  const lechVang =
    summary?.previous == null ? null : summary.goldenMinutes - summary.previous.goldenMinutes;

  /** Lãng phí chiếm bao nhiêu phần giờ tỉnh. Chưa ghi gì thì không có mẫu số để chia. */
  const tyLePhi =
    summary === null || summary.wakingMinutes === 0 || waste === null || waste.minutes === 0
      ? null
      : Math.round((waste.minutes * 100) / summary.wakingMinutes);

  return (
    <div className="chat">
      <div className="chat__dau">
        <div>
          <div className="title" style={{ fontSize: 21 }}>
            {labelDay(day)}
          </div>
          <div className="sm" style={{ marginTop: 2 }}>
            Mira
          </div>
        </div>
        <Link to="/toi" className="sm">
          Tôi ›
        </Link>
      </div>

      {/*
        Ba con số, không phải mười hai. Đây là màn để GÕ, phần đọc số nằm ở các tab kia.

        Mỗi ô có thêm một DÒNG ĐỌC THỨ HAI. Một con số trần thì ngày thứ chín không còn
        gì để nhìn — mà giữ cho mới mẻ là đòn bẩy +49% trong giả lập. Dòng thứ hai nói
        con số ấy đang đi hướng nào, hoặc nó lớn cỡ nào so với cả ngày.

        Dòng ấy VẮNG khi chưa đủ căn cứ, không điền bừa một số 0.
      */}
      <div className="chat__so">
        <Link to="/tai-chinh" className="chat__o chat__o--tudo">
          <b>{fmtMonths(derived?.freeCapitalMonths ?? null)}</b>
          <span>tháng tự do</span>
          {derived?.surplusPerMille != null && (
            <i className="chat__phu">dư {Math.round(derived.surplusPerMille / 10)}% thu nhập</i>
          )}
        </Link>
        <Link to="/thoi-gian/family" className="chat__o chat__o--vang">
          <b style={{ color: 'var(--green)' }}>
            {summary === null || summary.goldenMinutes === 0 ? UNKNOWN : fmtMinutes(summary.goldenMinutes)}
          </b>
          <span>giờ vàng tuần</span>
          {lechVang !== null && (
            <i className="chat__phu" style={{ color: lechVang >= 0 ? 'var(--green)' : 'var(--fg-muted)' }}>
              {lechVang >= 0 ? '▲' : '▼'} {fmtMinutes(Math.abs(lechVang))} so tuần trước
            </i>
          )}
        </Link>
        <Link to="/thoi-gian/waste" className="chat__o chat__o--phi">
          <b style={{ color: 'var(--amber)' }}>
            {waste === null || waste.minutes === 0 ? UNKNOWN : fmtMinutes(waste.minutes)}
          </b>
          <span>lãng phí tuần</span>
          {tyLePhi !== null && <i className="chat__phu">≈ {tyLePhi}% giờ tỉnh</i>}
        </Link>
      </div>

      <div className="chat__cuon">
        {dong.length === 0 && (
          <div className="chat__moi">
            <p>Gõ một câu như nói với người quen:</p>
            <ul>
              <li>sáng nay họp 3 tiếng</li>
              <li>chơi với con 1 tiếng</li>
              <li>lướt điện thoại 45 phút</li>
              <li>hôm nay vui, con tự xúc hết bát cơm</li>
              <li>lương tháng này 18 triệu</li>
            </ul>
            <p className="chat__nho">
              Mira ghi luôn, không hỏi lại. Đọc sai thì bấm Hoàn tác. Việc nào ngày nào
              cũng làm thì khai một nếp bên <Link to="/thoi-gian">Thời gian</Link>, khỏi gõ
              lại.
            </p>
          </div>
        )}

        {dong.map((d) => (
          <div key={d.id} className={d.ai === 'toi' ? 'bong bong--toi' : 'bong bong--mira'}>
            {d.chu !== undefined && <p className="bong__chu">{d.chu}</p>}
            {d.ketQua !== undefined && (
              <TraLoi
                ketQua={d.ketQua}
                dong={d}
                homNay={day}
                onHoanTac={() => {
                  if (d.veT !== undefined) void hoanTac(d.id, d.veT);
                }}
              />
            )}
          </div>
        ))}

        {dangDoc && <div className="bong bong--mira bong__cho">Đang đọc…</div>}
        <div ref={duoi} />
      </div>

      {/*
        Ghi nhanh: một chạm thay vì một câu.

        Phím rút từ CHÍNH nhật ký người dùng, không phải một danh sách gõ cứng. Mẫu tham
        khảo có tám ô cố định (Vận động, Ăn uống, Đọc sách…) — đẹp trong ảnh, nhưng đó là
        danh mục của người thiết kế. Người ngồi đây đi làm 8 tiếng, đi lại 2 tiếng, ăn tối
        30 phút; đó mới là phím đúng.

        Chưa đủ dữ liệu thì hàng này KHÔNG hiện. Một hàng phím rỗng là thêm một khoảng
        trống bấm được, không phải một lối tắt.
      */}
      {goi.length > 0 && (
        <div className="chat__nhanh">
          {goi.map((g) => (
            <button
              key={g.khoa}
              type="button"
              className="nhanh"
              disabled={dangDoc}
              onClick={() => void ghiNhanh(g)}
            >
              <b>{g.nhan}</b>
              <span>{fmtMinutes(g.minutes)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="chat__go">
        <input
          value={cau}
          onChange={(e) => setCau(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void gui();
          }}
          placeholder="Hôm nay có gì?"
          aria-label="Gõ một câu"
        />
        <button type="button" onClick={() => void gui()} disabled={cau.trim() === '' || dangDoc}>
          Gửi
        </button>
      </div>
    </div>
  );
}

function TraLoi({
  ketQua,
  dong,
  onHoanTac,
  homNay,
}: {
  readonly ketQua: KetQuaDoc;
  readonly dong: Dong;
  readonly onHoanTac: () => void;
  readonly homNay: string;
}) {
  const [dangGo, setDangGo] = useState(false);

  if (ketQua.nguon === 'chiu' || ketQua.yChi.length === 0) {
    return (
      <p className="bong__chu">
        Mira chưa hiểu câu này. Thử nói rõ hơn số giờ hoặc số tiền, hoặc ghi tay bên tab
        Thời gian.
      </p>
    );
  }

  // `khongGhi` và `chuaHieu` không ghi được, nên câu chỉ gồm hai loại đó thì không có gì
  // để gỡ và cũng không hiện dòng trạng thái nào.
  const ghiDuoc = ketQua.yChi.filter(
    (y) => y.loai === 'gio' || y.loai === 'hat' || y.loai === 'tien',
  );

  return (
    <>
      {ghiDuoc.length > 0 && <p className="bong__dau">{tieuDe(ghiDuoc, dong)}</p>}

      {ketQua.yChi.map((y, i) => (
        <TheY key={i} y={y} homNay={homNay} />
      ))}

      {dong.loiGhi !== undefined && <p className="y y--khong">Ghi hỏng: {dong.loiGhi}</p>}

      {ghiDuoc.length > 0 && dong.daGhi === true && dong.daHoanTac !== true && (
        <p className="bong__chan">
          <span className="bong__xong">Đã vào nhật ký</span>
          <button
            type="button"
            className="bong__go"
            disabled={dangGo || dong.veT === undefined}
            onClick={() => {
              setDangGo(true);
              onHoanTac();
            }}
          >
            {dangGo ? 'Đang gỡ…' : '↺ Hoàn tác'}
          </button>
        </p>
      )}
    </>
  );
}

/**
 * Dòng tiêu đề của thẻ kết quả.
 *
 * Nói **đã ghi mấy mục và loại gì**, vì một câu có thể ra hai mục giờ cộng một hạt, và
 * lúc đó danh sách thẻ bên dưới không tự nói ra con số ấy. Đếm sai ở đây là nói dối về
 * một việc vừa xảy ra trong nhật ký của người ta, nên nó đếm thật chứ không ghi cứng.
 */
function tieuDe(ghiDuoc: readonly YChi[], dong: Dong): string {
  if (dong.daHoanTac === true) return 'Đã gỡ lại.';
  if (dong.dangGhi === true) return 'Đang ghi…';

  const dem = { gio: 0, hat: 0, tien: 0 };
  for (const y of ghiDuoc) {
    if (y.loai === 'gio') dem.gio += 1;
    else if (y.loai === 'hat') dem.hat += 1;
    else if (y.loai === 'tien') dem.tien += 1;
  }
  const phan = [
    dem.gio > 0 ? `${dem.gio} mục giờ` : null,
    dem.hat > 0 ? `${dem.hat} hạt` : null,
    dem.tien > 0 ? `${dem.tien} ô tiền` : null,
  ].filter((x): x is string => x !== null);

  return `Đã ghi ${phan.join(' · ')}`;
}

/**
 * Một đề xuất.
 *
 * Ngày chỉ hiện khi **khác hôm nay**. Hiện "Hôm nay" trên mọi thẻ thì nó thành chữ trang
 * trí ai cũng bỏ qua, và đúng lúc nó ghi "Thứ 3" thì cũng không ai đọc nữa. Chỗ cần người
 * dùng nhìn là chỗ Mira đã suy ra một ngày khác với mặc định.
 */
function TheY({ y, homNay }: { readonly y: YChi; readonly homNay: string }) {
  if (y.loai === 'khongGhi') {
    return <p className="y y--khong">{y.viSao}</p>;
  }
  if (y.loai === 'chuaHieu') {
    return (
      <p className="y y--khong">
        Chỗ này Mira chưa đọc được: «{y.doan}». Những mục trên vẫn ghi được; chỗ này thì
        ghi tay ở tab Thời gian.
      </p>
    );
  }
  if (y.loai === 'gio') {
    return (
      <div className="y">
        <b>{y.ten}</b>
        <span>
          {fmtMinutes(y.minutes)}
          {y.ngay !== homNay ? ` · ${labelDay(y.ngay)}` : ''}
        </span>
        {/* Viên ô, không phải chữ nối bằng dấu chấm: ô là thứ quyết định con số này rơi
            vào đâu, nên nó phải đọc được bằng một cái liếc. Nhãn tiếng Việt — giao diện
            này không có chỗ cho chữ "Work". */}
        <i className={`vien vien--${y.bucket}`}>
          {y.golden ? 'Giờ vàng' : BUCKET_LABEL_VI[y.bucket]}
        </i>
      </div>
    );
  }
  if (y.loai === 'hat') {
    return (
      <div className="y">
        <b>
          <i className={y.kind === 'candy' ? 'y__keo' : 'y__muoi'} /> {y.kind === 'candy' ? 'Viên kẹo' : 'Hạt muối'}
          {y.ngay !== homNay ? ` · ${labelDay(y.ngay)}` : ''}
        </b>
        <span>{y.text}</span>
      </div>
    );
  }
  return (
    <div className="y">
      <b>{O_TIEN_LABEL_VI[y.o]}</b>
      <span>
        {y.cong ? `+ ${vnd(y.vnd)}` : vnd(y.vnd)}
        {y.cong ? '' : ' · đặt lại'}
        {y.thang !== monthOf(homNay) ? ` · tháng ${y.thang.slice(5)}/${y.thang.slice(0, 4)}` : ''}
      </span>
    </div>
  );
}
