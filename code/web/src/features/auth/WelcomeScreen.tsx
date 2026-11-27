import { useRef, useState } from 'react';
import './WelcomeScreen.css';

/**
 * Màn chào trước khi đăng nhập. Khuôn lấy từ PUKATO
 * (`Vessel360/code/web/src/features/owner/pages/WelcomePage.tsx`): bốn trang vuốt ngang,
 * chấm chỉ vị trí, nút chính dưới cùng, và một đường tắt sang đăng nhập.
 *
 * KHÁC PUKATO MỘT CHỖ CÓ CHỦ Ý: PUKATO chỉ chào trong app Android/iOS, web thì vào thẳng
 * /login, và nó nhớ "đã xem" trong localStorage. Mira hiện **chỉ có web**, nên làm vậy
 * thì màn chào không bao giờ xuất hiện. Ở đây nó là trang mặc định cho người chưa đăng
 * nhập, và **không nhớ gì cả** — người đã có tài khoản bấm "Đăng nhập" là qua ngay.
 * Không nhớ cũng đúng với quyết định hôm nay: localStorage chỉ giữ token, không gì khác.
 *
 * Số trên các thẻ là **số thật của Founder**, không phải số bịa cho đẹp: 24 ngày Thời gian
 * sử dụng iPhone cộng khung ngày đã khai. Nếu một ngày nào đó chúng thành số bịa thì màn
 * này nói dối ngay từ câu đầu tiên.
 */
/**
 * ─────────────────────── NỘI DUNG LẤY TỪ MOCKUP FOUNDER GỬI ───────────────────────
 *
 * Năm bước, mỗi bước một nhãn nhỏ + một câu lớn + một đoạn giải thích — đúng khuôn
 * `mira_welcome_mockup.html`. Thứ tự cũng theo mockup: chào → thời gian → tiền → nếp →
 * khép lại.
 *
 * **Dịch sang tiếng Việt**, theo quyết định đã chốt: mã tiếng Anh, chú thích và chữ trên
 * màn hình tiếng Việt. Giọng giữ nguyên của mockup — điềm đạm, không hô khẩu hiệu.
 *
 * **KHÔNG lấy phần hình của mockup.** Hình trong đó là nhãn bịa cho đẹp ("Needs · 34%",
 * "Focus / Personal / Rest"). Màn này đã có luật riêng ghi ngay dưới đây: số trên thẻ là
 * số thật. Dán nhãn bịa vào là màn chào nói dối ngay từ câu đầu. Nên lấy chữ của mockup,
 * giữ thẻ của Mira.
 */
const PAGE_COUNT = 5;

export function WelcomeScreen({ onSignIn }: { readonly onSignIn: () => void }) {
  const [idx, setIdx] = useState(0);
  const ray = useRef<HTMLDivElement>(null);
  /** Trang đang cuộn tới, hoặc null khi đang đứng yên. Xem `khiCuon` để biết tại sao cần. */
  const dich = useRef<number | null>(null);

  const den = (i: number) => {
    const k = Math.max(0, Math.min(PAGE_COUNT - 1, i));
    setIdx(k);
    const el = ray.current;
    if (el === null) return;
    const trai = k * el.clientWidth;
    dich.current = k;
    el.scrollTo({ left: trai, behavior: 'smooth' });

    // Có WebView bỏ qua cuộn mượt khi bật scroll-snap. Không nhích thì nhảy thẳng.
    const tu = el.scrollLeft;
    window.setTimeout(() => {
      if (Math.abs(el.scrollLeft - trai) > 2 && Math.abs(el.scrollLeft - tu) < 2) {
        el.scrollLeft = trai;
        dich.current = null;
      }
    }, 350);
  };

  /**
   * Cuộn tay thì cập nhật chấm theo vị trí. Nhưng cuộn **mượt** cũng bắn sự kiện này suốt
   * dọc đường, nên nếu nhận bừa thì bấm "Tiếp" hai lần liên tiếp sẽ cho `idx` một giá trị
   * nằm giữa đường, và chấm chạy lệch khỏi nội dung. Đang có đích thì im lặng cho tới khi
   * tới nơi.
   */
  const khiCuon = () => {
    const el = ray.current;
    if (el === null) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);

    if (dich.current !== null) {
      if (Math.abs(el.scrollLeft - dich.current * el.clientWidth) <= 2) dich.current = null;
      return;
    }
    if (k !== idx) setIdx(k);
  };

  const last = idx === PAGE_COUNT - 1;

  return (
    <div className="wel">
      <div className="wel__top">
        <span className="wel__logo">Mira</span>
        <button
          type="button"
          className="wel__skip"
          style={{ visibility: last ? 'hidden' : 'visible' }}
          onClick={onSignIn}
        >
          Bỏ qua
        </button>
      </div>

      <div className="wel__track" ref={ray} onScroll={khiCuon}>
        <Trang
          k="CHÀO MỪNG ĐẾN MIRA"
          h="Rõ hơn một chút. Sống có chủ ý hơn một chút."
          p="Ngày của bạn đầy những lựa chọn. Mira giúp bạn nhìn ra điều gì đáng — rồi chừa thêm chỗ cho nó."
        >
          <Dau />
        </Trang>

        <Trang
          k="THỜI GIAN, NHÌN CHO RÕ"
          h="Nhìn xem thời gian thật sự đi đâu."
          p="Để ý nhịp ngày của bạn. Hiểu cái gì đang lấy mất sự chú ý, và cái gì đáng được nhiều hơn."
        >
          <div className="wel__card">
            <div className="wel__row">
              <b>Tuần này</b>
              <span className="wel__tag">119h giờ tỉnh</span>
            </div>
            <div className="wel__bars">
              <Bar ten="Công việc" pct={59} color="var(--navy)" so="70h" />
              <Bar ten="Lãng phí" pct={30} color="var(--candy)" so="35h 42m" />
              <Bar ten="Gia đình" pct={8} color="var(--green)" so="9h 48m" />
              <Bar ten="Cá nhân" pct={3} color="var(--purple)" so="3h 30m" />
            </div>
          </div>
          <div className="wel__dark">
            <span className="wel__dark-k">ĐIỆN THOẠI ĂN MẤT</span>
            <b className="wel__big">4h 45m</b>
            <span className="wel__dark-s">mỗi ngày, trong 6 giờ rảnh buổi tối</span>
          </div>
        </Trang>

        <Trang
          k="TIỀN, CHO CÓ NGHĨA"
          h="Làm cho đồng tiền có nghĩa hơn."
          p="Nhìn chi tiêu với một góc rộng hơn. Nối những lựa chọn thường ngày với cuộc sống bạn muốn dựng."
        >
          <div className="wel__card wel__feats">
            <Muc a="Vốn tự do" b="Bạn sống được bao nhiêu tháng nếu dừng lại hôm nay" />
            <Muc a="Mục tiêu có nguyên liệu" b="Muốn 4h mỗi tuần thì phải cắt 4h từ đâu đó" />
            <Muc a="Thói quen đếm theo tuần" b="Không có chuỗi ngày để làm bạn sợ đứt" />
          </div>
        </Trang>

        <Trang
          k="NẾP NHỎ, THẤY ĐƯỢC NHIỀU"
          h="Hiểu những nếp lặp đi lặp lại."
          p="Nhận ra thói quen và nếp đang nặn nên ngày của bạn. Một quan sát nhỏ cũng đủ đổi một điều lớn."
        >
          <div className="wel__card wel__list">
            <Hat loai="candy" chu="Con tự đọc hết một trang sách" ngay="Hôm nay" />
            <Hat loai="salt" chu="Họp tới 9 giờ tối, lại lỡ bữa cơm" ngay="Thứ 2" />
            <Hat loai="candy" chu="Đi bộ với vợ một vòng hồ" ngay="Chủ nhật" />
          </div>
          <div className="wel__card wel__ask">
            <span className="wel__k">HỎI LẠI SAU 42 NGÀY</span>
            <p>“Chuyện hôm đó giờ thế nào?”</p>
            <div className="wel__chips">
              <span>Vẫn vậy</span>
              <span>Nhẹ hơn</span>
              <span>Qua rồi</span>
            </div>
          </div>
        </Trang>

        <Trang
          k="MỘT ĐỜI CÓ CHỦ Ý HƠN"
          h="Chừa chỗ cho điều đáng."
          p="Bắt đầu bằng một cái nhìn rõ hơn về thời gian, tiền và ngày thường. Đi theo nhịp của bạn — mỗi lần một bước nhỏ."
        >
          <Dau khep />
          <div className="wel__pills">
            <span>Không quảng cáo</span>
            <span>Dữ liệu chỉ bạn đọc</span>
          </div>
        </Trang>
      </div>

      <div className="wel__dots" role="tablist">
        {Array.from({ length: PAGE_COUNT }, (_, k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === idx}
            aria-label={`Trang ${k + 1}`}
            className={k === idx ? 'is-on' : undefined}
            onClick={() => den(k)}
          />
        ))}
      </div>

      <div className="wel__cta">
        <button
          type="button"
          className="wel__go"
          onClick={() => (last ? onSignIn() : den(idx + 1))}
        >
          {last ? 'Bắt đầu' : 'Tiếp'}
        </button>
        <button type="button" className="wel__link" onClick={onSignIn}>
          Đã có tài khoản? <b>Đăng nhập</b>
        </button>
        <p
          style={{ fontSize: 12.5, color: 'var(--fg-dim)', textAlign: 'center', margin: '6px 0 0' }}
        >
          <a href="/privacy">Chính sách riêng tư</a> · <a href="/terms">Điều khoản</a>
        </p>
      </div>
    </div>
  );
}

/**
 * Một bước.
 *
 * Thứ tự **chữ trước, hình sau** — theo mockup, và đổi so với bản cũ (hình trước, chữ
 * sau). Người ta đọc lời hứa rồi mới nhìn bằng chứng; nhìn bằng chứng trước thì chưa biết
 * đang nhìn cái gì.
 */
function Trang({
  k,
  h,
  p,
  children,
}: {
  readonly k: string;
  readonly h: string;
  readonly p: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="wel__slide">
      <div className="wel__kicker">{k}</div>
      <h1 className="wel__h">{h}</h1>
      <p className="wel__p">{p}</p>
      <div className="wel__art" aria-hidden>
        {children}
      </div>
    </section>
  );
}

/**
 * Dấu của Mira: mấy vòng đồng tâm, chữ `m` ở giữa.
 *
 * Bước đầu và bước cuối không có số nào để khoe, nên chúng mang dấu thay vì một cái thẻ.
 * Đây là chỗ duy nhất trong màn này không phải dữ liệu — và nó cũng không giả vờ là dữ
 * liệu, nên không phạm luật "số trên thẻ là số thật".
 */
function Dau({ khep = false }: { readonly khep?: boolean }) {
  return (
    <div className={khep ? 'wel__dau wel__dau--khep' : 'wel__dau'}>
      <i />
      <i />
      <span>m</span>
    </div>
  );
}

function Bar({
  ten,
  pct,
  color,
  so,
}: {
  readonly ten: string;
  readonly pct: number;
  readonly color: string;
  readonly so: string;
}) {
  return (
    <div className="wel__bline">
      <span className="wel__bname">{ten}</span>
      <span className="wel__btrack">
        <span style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="wel__bnum">{so}</span>
    </div>
  );
}

function Hat({
  loai,
  chu,
  ngay,
}: {
  readonly loai: 'candy' | 'salt';
  readonly chu: string;
  readonly ngay: string;
}) {
  return (
    <div className="wel__hat">
      <span className={loai === 'candy' ? 'wel__candy' : 'wel__salt'} />
      <span className="wel__two">
        <span>{chu}</span>
        <span className="wel__muted">{ngay}</span>
      </span>
    </div>
  );
}

function Muc({ a, b }: { readonly a: string; readonly b: string }) {
  return (
    <div className="wel__feat">
      <span className="wel__two">
        <b>{a}</b>
        <span className="wel__muted">{b}</span>
      </span>
    </div>
  );
}
