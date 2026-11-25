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
const SO_TRANG = 4;

export function WelcomeScreen({ onVao }: { readonly onVao: () => void }) {
  const [idx, setIdx] = useState(0);
  const ray = useRef<HTMLDivElement>(null);
  /** Trang đang cuộn tới, hoặc null khi đang đứng yên. Xem `khiCuon` để biết tại sao cần. */
  const dich = useRef<number | null>(null);

  const den = (i: number) => {
    const k = Math.max(0, Math.min(SO_TRANG - 1, i));
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

  const cuoi = idx === SO_TRANG - 1;

  return (
    <div className="wel">
      <div className="wel__top">
        <span className="wel__logo">Mira</span>
        <button
          type="button"
          className="wel__skip"
          style={{ visibility: cuoi ? 'hidden' : 'visible' }}
          onClick={onVao}
        >
          Bỏ qua
        </button>
      </div>

      <div className="wel__track" ref={ray} onScroll={khiCuon}>
        <Trang
          h="Một ngày của bạn đi đâu hết"
          p="Không phải cảm giác. Là giờ, chia theo bốn ô, cộng lại đúng số giờ bạn thức."
        >
          <div className="wel__card">
            <div className="wel__row">
              <b>Tuần này</b>
              <span className="wel__tag">119h giờ tỉnh</span>
            </div>
            <div className="wel__bars">
              <Bar ten="Công việc" pct={59} mau="var(--navy)" so="70h" />
              <Bar ten="Lãng phí" pct={30} mau="var(--candy)" so="35h 42m" />
              <Bar ten="Gia đình" pct={8} mau="var(--green)" so="9h 48m" />
              <Bar ten="Cá nhân" pct={3} mau="var(--purple)" so="3h 30m" />
            </div>
          </div>
        </Trang>

        <Trang
          h="Giờ vàng, không phải giờ ở cùng nhà"
          p="Ngồi cùng phòng mà mỗi người một màn hình thì không tính. Mira chỉ đếm lúc bạn thật sự có mặt."
        >
          <div className="wel__card">
            <span className="wel__k">TRONG GIỜ GIA ĐÌNH</span>
            <div className="wel__meter">
              <span style={{ width: '85%' }} />
            </div>
            <div className="wel__row">
              <b>Giờ vàng 8h 42m</b>
              <span className="wel__muted">Còn lại 1h 30m</span>
            </div>
          </div>
          <div className="wel__dark">
            <span className="wel__dark-k">ĐIỆN THOẠI ĂN MẤT</span>
            <b className="wel__big">4h 45m</b>
            <span className="wel__dark-s">mỗi ngày, trong 6 giờ rảnh buổi tối</span>
          </div>
        </Trang>

        <Trang
          h="Viên kẹo và hạt muối"
          p="Ghi một dòng về hôm nay. Ngày nặng được hỏi lại đúng một lần, sau 42 ngày — để bạn thấy nó đã nhẹ đi chưa."
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
          h="Tiền và mục tiêu, cùng một chỗ"
          p="Vốn tự do tính theo tháng: tài sản ròng chia chi phí một tháng. Mục tiêu thì lấy giờ từ ô lãng phí, không lấy từ hư không."
        >
          <div className="wel__card wel__feats">
            <Muc a="Vốn tự do" b="Bạn sống được bao nhiêu tháng nếu dừng lại hôm nay" />
            <Muc a="Mục tiêu có nguyên liệu" b="Muốn 4h mỗi tuần thì phải cắt 4h từ đâu đó" />
            <Muc a="Thói quen đếm theo tuần" b="Không có chuỗi ngày để làm bạn sợ đứt" />
          </div>
          <div className="wel__pills">
            <span>Không quảng cáo</span>
            <span>Dữ liệu chỉ bạn đọc</span>
          </div>
        </Trang>
      </div>

      <div className="wel__dots" role="tablist">
        {Array.from({ length: SO_TRANG }, (_, k) => (
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
        <button type="button" className="wel__go" onClick={() => (cuoi ? onVao() : den(idx + 1))}>
          {cuoi ? 'Bắt đầu' : 'Tiếp'}
        </button>
        <button type="button" className="wel__link" onClick={onVao}>
          Đã có tài khoản? <b>Đăng nhập</b>
        </button>
      </div>
    </div>
  );
}

function Trang({
  h,
  p,
  children,
}: {
  readonly h: string;
  readonly p: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="wel__slide">
      <div className="wel__art" aria-hidden>
        {children}
      </div>
      <h1 className="wel__h">{h}</h1>
      <p className="wel__p">{p}</p>
    </section>
  );
}

function Bar({
  ten,
  pct,
  mau,
  so,
}: {
  readonly ten: string;
  readonly pct: number;
  readonly mau: string;
  readonly so: string;
}) {
  return (
    <div className="wel__bline">
      <span className="wel__bname">{ten}</span>
      <span className="wel__btrack">
        <span style={{ width: `${pct}%`, background: mau }} />
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
