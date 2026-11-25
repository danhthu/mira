import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BUCKET_LABEL_VI,
  O_TIEN_LABEL_VI,
  type KetQuaDoc,
  type YChi,
} from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { labelDay, monthOf, today, weekStartOf } from '../../lib/date';
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
  /** Đã ghi rồi thì không cho ghi lại. */
  readonly daGhi?: boolean;
}

let demDong = 0;

export function ChatScreen() {
  const day = today();
  const [dong, setDong] = useState<Dong[]>([]);
  const [cau, setCau] = useState('');
  const [dangDoc, setDangDoc] = useState(false);
  const duoi = useRef<HTMLDivElement>(null);

  const tomTat = useAsync(async () => {
    const [summary, money] = await Promise.all([
      store.weekSummary(weekStartOf(day)),
      store.getMoney(monthOf(day)),
    ]);
    return { summary, money };
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
      setDong((d) => [...d, { id: (demDong += 1), ai: 'mira', ketQua }]);
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
    for (const y of yChi) {
      if (y.loai === 'gio') {
        await store.createTimeEntry({
          date: y.ngay,
          minutes: y.minutes,
          bucket: y.bucket,
          golden: y.golden,
          note: y.danhMucId === null ? y.ten : null,
          danhMucId: y.danhMucId,
        });
      } else if (y.loai === 'hat') {
        await store.createMoment({ date: y.ngay, kind: y.kind, text: y.text });
      } else if (y.loai === 'tien') {
        await store.saveMoney(y.thang, { [y.o]: y.vnd });
      }
    }
    setDong((d) => d.map((x) => (x.id === id ? { ...x, daGhi: true } : x)));
    tomTat.reload();
  }

  const summary = tomTat.data?.summary ?? null;
  const derived = tomTat.data?.money.derived ?? null;
  const waste = summary?.slices.find((s) => s.bucket === 'waste') ?? null;

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

      {/* Ba con số, không phải mười hai. Đây là màn để GÕ, phần đọc số nằm ở các tab kia. */}
      <div className="chat__so">
        <Link to="/tai-chinh" className="chat__o">
          <b>{fmtMonths(derived?.freeCapitalMonths ?? null)}</b>
          <span>tháng tự do</span>
        </Link>
        <Link to="/thoi-gian/family" className="chat__o">
          <b style={{ color: 'var(--green)' }}>
            {summary === null || summary.goldenMinutes === 0 ? UNKNOWN : fmtMinutes(summary.goldenMinutes)}
          </b>
          <span>giờ vàng tuần</span>
        </Link>
        <Link to="/thoi-gian/waste" className="chat__o">
          <b style={{ color: 'var(--amber)' }}>
            {waste === null || waste.minutes === 0 ? UNKNOWN : fmtMinutes(waste.minutes)}
          </b>
          <span>lãng phí tuần</span>
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
              Mira đọc xong sẽ hỏi lại trước khi ghi. Việc nào ngày nào cũng làm thì khai
              một nếp bên <Link to="/thoi-gian">Thời gian</Link>, khỏi gõ lại.
            </p>
          </div>
        )}

        {dong.map((d) => (
          <div key={d.id} className={d.ai === 'toi' ? 'bong bong--toi' : 'bong bong--mira'}>
            {d.chu !== undefined && <p className="bong__chu">{d.chu}</p>}
            {d.ketQua !== undefined && (
              <TraLoi
                ketQua={d.ketQua}
                daGhi={d.daGhi === true}
                homNay={day}
                onGhi={() => void ghi(d.id, d.ketQua?.yChi ?? [])}
              />
            )}
          </div>
        ))}

        {dangDoc && <div className="bong bong--mira bong__cho">Đang đọc…</div>}
        <div ref={duoi} />
      </div>

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
  daGhi,
  onGhi,
  homNay,
}: {
  readonly ketQua: KetQuaDoc;
  readonly daGhi: boolean;
  readonly onGhi: () => void;
  readonly homNay: string;
}) {
  const [dangGhi, setDangGhi] = useState(false);

  if (ketQua.nguon === 'chiu' || ketQua.yChi.length === 0) {
    return (
      <p className="bong__chu">
        Mira chưa hiểu câu này. Thử nói rõ hơn số giờ hoặc số tiền, hoặc ghi tay bên tab
        Thời gian.
      </p>
    );
  }

  // Có gì ghi được thì mới hiện nút. `khongGhi` và `chuaHieu` đều không ghi được, nên
  // một câu chỉ gồm hai loại đó thì cái nút "Ghi" sẽ không làm gì — và một cái nút bấm
  // vào không có chuyện gì xảy ra là chỗ người dùng mất tin vào cả màn hình.
  const coGhiDuoc = ketQua.yChi.some(
    (y) => y.loai === 'gio' || y.loai === 'hat' || y.loai === 'tien',
  );

  return (
    <>
      {ketQua.yChi.map((y, i) => (
        <TheY key={i} y={y} homNay={homNay} />
      ))}

      {coGhiDuoc &&
        (daGhi ? (
          <p className="bong__xong">Đã ghi.</p>
        ) : (
          <button
            type="button"
            className="bong__ghi"
            disabled={dangGhi}
            onClick={() => {
              setDangGhi(true);
              onGhi();
            }}
          >
            {dangGhi ? 'Đang ghi…' : 'Ghi'}
          </button>
        ))}
    </>
  );
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
          {fmtMinutes(y.minutes)} · {BUCKET_LABEL_VI[y.bucket]}
          {y.golden ? ' · giờ vàng' : ''}
          {y.ngay !== homNay ? ` · ${labelDay(y.ngay)}` : ''}
        </span>
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
        {vnd(y.vnd)}
        {y.thang !== monthOf(homNay) ? ` · tháng ${y.thang.slice(5)}/${y.thang.slice(0, 4)}` : ''}
      </span>
    </div>
  );
}
