/**
 * Mira trả lời câu hỏi.
 *
 * Founder gõ "xem ở đâu" vào khung chat và nhận về "Mira chưa hiểu câu này" — đúng về
 * mặt kỹ thuật, vô dụng về mặt con người. Khung chat mời người ta gõ một câu như nói với
 * người quen, rồi im lặng khi họ hỏi một câu như nói với người quen.
 *
 * **Máy chủ chỉ phân loại, client soạn câu trả lời.** Số liệu đã tải sẵn ở màn Nhật ký,
 * và đường dẫn sang đúng tab cũng nằm ở đây. Bắt máy chủ soạn thì phải tải lại hết một
 * lần nữa rồi trả về một cục chữ không bấm được.
 *
 * KHÔNG CÓ LLM Ở ĐÂY. Mira trả lời bằng chính con số nó đang giữ, hoặc nói thẳng là nó
 * không trả lời được. Bịa ra một câu nghe trơn tru là thứ tệ nhất một cuốn nhật ký có
 * thể làm.
 */
import { Link } from 'react-router-dom';
import type { QuestionTopic, TimeEntry, WeekSummary, MoneyMonth, MoneyDerived } from '@mira/contract';
import { BUCKET_LABEL_VI, MONEY_CELL_LABEL_VI } from '@mira/contract';
import { minutes as fmtMinutes, months as fmtMonths, vnd as fmtVnd } from '../../lib/format';

export interface AnswerSource {
  readonly summary: WeekSummary | null;
  readonly money: MoneyMonth | null;
  readonly derived: MoneyDerived | null;
  readonly homNayDs: readonly TimeEntry[];
  readonly keo: number;
  readonly muoi: number;
}

/** Câu gợi ý gõ, dùng ở hai chỗ nên để một chỗ. */
const EXAMPLES = [
  'sáng nay họp 3 tiếng',
  'chơi với con 1 tiếng',
  'lướt điện thoại 45 phút',
  'hôm nay vui, con tự xúc hết bát cơm',
  'lương tháng này 18 triệu',
];

export function AnswerQuestion({ topic, n }: { readonly topic: QuestionTopic; readonly n: AnswerSource }) {
  if (topic === 'howToLog') {
    return (
      <div className="dap">
        <p>Gõ một câu như nói với người quen. Mira ghi luôn, không hỏi lại:</p>
        <ul className="dap__vd">
          {EXAMPLES.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="dap__chu">
          Đọc sai thì bấm Hoàn tác ngay dưới câu trả lời. Việc nào ngày nào cũng làm thì
          khai một <Link to="/thoi-gian">nếp</Link>, khỏi gõ lại.
        </p>
      </div>
    );
  }

  if (topic === 'whereIsIt') {
    return (
      <div className="dap">
        <p>Mọi thứ đã ghi nằm ở mấy chỗ này:</p>
        <ul className="dap__ds">
          <li>
            <Link to="/thoi-gian">Thời gian</Link> — từng mục giờ, sửa ô và xoá ở đây
          </li>
          <li>
            <Link to="/tai-chinh">Tài chính</Link> — bảy ô tiền của tháng
          </li>
          <li>
            <Link to="/muc-tieu">Mục tiêu</Link> — việc đang muốn làm
          </li>
          <li>
            <Link to="/hu">Hũ</Link> — hũ kẹo và hũ muối
          </li>
        </ul>
      </div>
    );
  }

  if (topic === 'today') {
    if (n.homNayDs.length === 0) {
      return (
        <div className="dap">
          <p>Hôm nay chưa ghi gì cả. Gõ một câu là xong.</p>
        </div>
      );
    }
    const total = n.homNayDs.reduce((t, e) => t + e.minutes, 0);
    return (
      <div className="dap">
        <p>
          Hôm nay đã ghi <b>{fmtMinutes(total)}</b>, {n.homNayDs.length} mục:
        </p>
        <ul className="dap__ds">
          {n.homNayDs.map((e) => (
            <li key={e.id}>
              {e.note ?? BUCKET_LABEL_VI[e.bucket]} · {fmtMinutes(e.minutes)} ·{' '}
              {BUCKET_LABEL_VI[e.bucket]}
            </li>
          ))}
        </ul>
        <p className="dap__chu">
          Sửa hay xoá ở <Link to="/thoi-gian">Thời gian</Link>.
        </p>
      </div>
    );
  }

  if (topic === 'thisWeek') {
    const s = n.summary;
    if (s === null || s.loggedMinutes === 0) {
      return (
        <div className="dap">
          <p>Tuần này chưa có gì trong sổ.</p>
        </div>
      );
    }
    return (
      <div className="dap">
        <p>
          Tuần này ghi <b>{fmtMinutes(s.loggedMinutes)}</b> trên {s.recordedDays} ngày:
        </p>
        <ul className="dap__ds">
          {[...s.slices]
            .filter((x) => x.minutes > 0)
            .sort((a, b) => b.minutes - a.minutes)
            .map((x) => (
              <li key={x.bucket}>
                {BUCKET_LABEL_VI[x.bucket]} · {fmtMinutes(x.minutes)}
              </li>
            ))}
        </ul>
        <p className="dap__chu">
          Chi tiết ở <Link to="/thoi-gian">Thời gian</Link>.
        </p>
      </div>
    );
  }

  if (topic === 'money') {
    const m = n.money;
    const hasNumbers = m !== null && Object.values(m).some((v) => typeof v === 'number' && v > 0);
    if (!hasNumbers) {
      return (
        <div className="dap">
          <p>
            Tháng này chưa có con số nào. Gõ "lương 18 triệu" hoặc điền thẳng bên{' '}
            <Link to="/tai-chinh">Tài chính</Link>.
          </p>
        </div>
      );
    }
    const o = [
      'netIncome',
      'monthlyExpense',
      'investment',
      'wastedMoney',
      'debtPayment',
      'debtBalance',
      'netWorth',
    ] as const;
    return (
      <div className="dap">
        <p>Tháng này:</p>
        <ul className="dap__ds">
          {o
            .filter((k) => (m?.[k] ?? 0) > 0)
            .map((k) => (
              <li key={k}>
                {MONEY_CELL_LABEL_VI[k]} · {fmtVnd(m?.[k] ?? 0)}
              </li>
            ))}
        </ul>
        {n.derived?.freeCapitalMonths != null && (
          <p className="dap__chu">
            Vốn tự do: <b>{fmtMonths(n.derived.freeCapitalMonths)}</b> tháng sống được nếu
            thu nhập dừng. Đầy đủ ở <Link to="/tai-chinh">Tài chính</Link>.
          </p>
        )}
      </div>
    );
  }

  if (topic === 'jar') {
    if (n.keo === 0 && n.muoi === 0) {
      return (
        <div className="dap">
          <p>
            Hũ còn trống. Gõ "hôm nay vui vì…" hay "hôm nay mệt quá" là có hạt đầu tiên.
          </p>
        </div>
      );
    }
    return (
      <div className="dap">
        <p>
          Hũ đang có <b>{n.keo} viên kẹo</b> và <b>{n.muoi} hạt muối</b> trong 90 ngày
          gần đây.
        </p>
        <p className="dap__chu">
          Xem từng hạt ở <Link to="/hu">Hũ</Link>. Hạt muối sẽ được hỏi lại
          sau 42 ngày — để bạn thấy chuyện đó giờ ra sao.
        </p>
      </div>
    );
  }

  // khongRo — biết là câu hỏi, không biết hỏi gì.
  return (
    <div className="dap">
      <p>
        Mira là cuốn nhật ký, không phải trợ lý — nó không trả lời được câu này. Nó biết
        bốn thứ:
      </p>
      <ul className="dap__ds">
        <li>"hôm nay thế nào" — những gì đã ghi hôm nay</li>
        <li>"tuần này bao nhiêu" — giờ theo từng ô</li>
        <li>"tiền thế nào" — năm ô tiền của tháng</li>
        <li>"hũ ra sao" — kẹo và muối</li>
      </ul>
      <p className="dap__chu">Hỏi "ghi thế nào" nếu muốn biết cách gõ.</p>
    </div>
  );
}
