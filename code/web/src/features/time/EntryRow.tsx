import { useState } from 'react';
import {
  BUCKET_LABEL_VI,
  TIME_BUCKETS,
  type Category,
  type TimeBucket,
  type TimeEntry,
} from '@mira/contract';
import { labelDay } from '../../lib/date';
import { minutes as fmtMinutes } from '../../lib/format';
import { cadenceOf, type EntryGroup } from '../../lib/group';
import { store } from '../../lib/store';
import { RowActions } from '../../ui/RowActions';
import { Icon } from '../../ui/Icon';
import { BUCKET_ICON } from '../../lib/bucketColors';
import { timeStyle } from '../../lib/categoryStyle';

/**
 * Một mục lẻ, không thuộc nếp nào.
 *
 * Có nút **Sửa** và **Xoá** hiện ra ở cuối dòng. Trước đây hai việc ấy nấp sau một cú
 * chạm vào thân dòng, không có dấu hiệu gì — nên gõ `15` thay vì `1.5` là con số sai đó
 * nằm trong donut vĩnh viễn. `PATCH` và `DELETE` đã có trên máy chủ, api-client đã có
 * hàm gọi, và không màn nào gọi tới. Đường ống thông cả, chỉ thiếu nút.
 */
export function Dong({
  e,
  color,
  dungNhat,
  onChanged,
  categoryOf,
  hideDate = false,
}: {
  readonly e: TimeEntry;
  readonly color: string;
  readonly dungNhat: number;
  readonly onChanged: () => void;
  /**
   * Tra cả BẢN GHI danh mục, không chỉ cái tên.
   *
   * Trước đây prop này là `categoryName: (id) => string | null`. Giờ dòng còn cần hình và
   * màu riêng của danh mục, mà thêm một prop thứ hai cạnh nó là mời hai prop lệch nhau —
   * một màn truyền tên của bản ghi này và hình của bản ghi kia.
   */
  readonly categoryOf: (id: string | null) => Category | null;
  /** Danh sách đã có đầu ngày ở trên thì dòng thôi nhắc ngày. */
  readonly hideDate?: boolean;
}) {
  const [open, setMo] = useState(false);
  const dm = categoryOf(e.categoryId);
  // Danh mục là thứ người dùng đã khai là "việc gì"; ghi chú chỉ là lời riêng cho một
  // ngày. Có danh mục thì nó làm tiêu đề, ghi chú xuống dòng dưới.
  // Không danh mục thì ghi chú lên làm tên, kèm "Chưa xếp:" — cùng cách dải Lãng phí gọi,
  // để một ghi chú "Gia đình, …" không bị đọc thành tên danh mục. Hàng nếp sinh thì ghi
  // chú CHÍNH LÀ tên nếp, để nguyên.
  const ten =
    dm?.name ??
    (e.note === null || e.note.trim() === ''
      ? 'Ghi tay'
      : e.routineId !== null
        ? e.note
        : `Chưa xếp: ${e.note}`);
  const sub = dm != null && e.note !== null && e.note.trim() !== '' ? e.note : null;
  const kieu = timeStyle(dm, e.bucket, BUCKET_ICON[e.bucket]);

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      <div className="list-icon" style={{ background: '#edeff3', color: kieu.color }}>
        <Icon name={e.golden ? 'flame' : kieu.icon} size={19} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{ten}</div>
          <div style={{ fontWeight: 700, color: color, marginLeft: 'auto' }}>
            {fmtMinutes(e.minutes)}
          </div>
        </div>

        {/* Thanh tỉ lệ so với mục dài nhất. Lấy từ Focus Tracker (N-219): đọc một danh
            sách toàn số thì mắt so chiều dài nhanh hơn so chữ số. */}
        <div className="bar" style={{ marginTop: 6 }}>
          <i style={{ width: `${Math.round((e.minutes * 100) / dungNhat)}%`, background: color }} />
        </div>

        <div className="row-foot">
          <div className="sm" style={{ minWidth: 0 }}>
            {hideDate ? '' : labelDay(e.date)}
            {sub === null ? '' : `${hideDate ? '' : ' · '}${sub}`}
          </div>
          <RowActions
            onEdit={() => setMo(!open)}
            editing={open}
            onDelete={async () => {
              await store.deleteTimeEntry(e.id);
              onChanged();
            }}
            question="Xoá hẳn mục giờ này?"
          />
        </div>

        {open && (
          <EditEntry
            e={e}
            onDone={() => {
              setMo(false);
              onChanged();
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Sửa một mục giờ: số giờ, thuộc ô nào, và ghi chú.
 *
 * Sửa được **cả ba**, không chỉ số giờ. Ô là thứ dễ sai nhất khi ghi bằng chat — bộ đọc
 * câu không nhận ra việc gì thì nó đoán "Cá nhân" và đánh dấu là đoán. Chỉ cho sửa số
 * giờ thì mục bị đoán nhầm ô nằm sai trong donut vĩnh viễn, mà donut là cả màn hình.
 *
 * Không có ngày: đổi ngày của một mục đã ghi gần như luôn là muốn ghi một mục khác.
 */
function EditEntry({ e, onDone }: { readonly e: TimeEntry; readonly onDone: () => void }) {
  const [gio, setGio] = useState((e.minutes / 60).toFixed(2).replace(/\.?0+$/, ''));
  const [bucket, setBucket] = useState<TimeBucket>(e.bucket);
  const [note, setNote] = useState(e.note ?? '');
  const [busy, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const newMinutes = Math.round(Number(gio.replace(',', '.')) * 60);
  const hopLe = Number.isInteger(newMinutes) && newMinutes > 0 && newMinutes <= 1440;
  const newNote = note.trim() === '' ? null : note.trim();
  const changed = newMinutes !== e.minutes || bucket !== e.bucket || newNote !== e.note;

  async function save(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await store.updateTimeEntry(e.id, { minutes: newMinutes, bucket, note: newNote });
      onDone();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
      setDangChay(false);
    }
  }

  return (
    <div className="edit">
      <div className="pills pills--small" style={{ flexWrap: 'wrap' }}>
        {TIME_BUCKETS.map((b) => (
          <button key={b} type="button" aria-pressed={bucket === b} onClick={() => setBucket(b)}>
            {BUCKET_LABEL_VI[b]}
          </button>
        ))}
      </div>

      <input
        className="edit__text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú (không bắt buộc)"
        aria-label="Ghi chú"
      />

      <div className="edit__row" style={{ marginTop: 10 }}>
        <input
          value={gio}
          onChange={(event) => setGio(event.target.value)}
          inputMode="decimal"
          aria-label="Số giờ"
        />
        <span className="sm">giờ</span>
        <button
          type="button"
          className="edit__save"
          disabled={!hopLe || busy || !changed}
          onClick={() => void save()}
        >
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>

      {!hopLe && (
        <p className="empty" style={{ marginTop: 8 }}>
          Số giờ phải lớn hơn 0 và không quá 24.
        </p>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}
    </div>
  );
}

/**
 * Một nếp lặp, gom thành một dòng.
 *
 * Dòng này nói ba điều mà hai mươi tám dòng rời không nói được: nhịp, tổng giờ, và **mấy
 * ngày không theo nếp**. Ngày lệch hiện thẳng ra chứ không nằm sau nút mở, vì trong một
 * nếp đều thì đó là phần duy nhất còn tin.
 *
 * Biểu tượng ↻ thay cho dấu chấm: nhìn một cái là biết dòng này gom nhiều ngày, không
 * phải một ngày.
 */
export function GroupRow({
  group,
  color,
  dungNhat,
  onChanged,
  categoryOf,
}: {
  readonly group: EntryGroup;
  readonly color: string;
  readonly dungNhat: number;
  readonly onChanged: () => void;
  readonly categoryOf: (id: string | null) => Category | null;
}) {
  const [open, setMo] = useState(false);
  const dm = categoryOf(group.categoryId);
  const ten = dm?.name ?? (group.note === '' ? 'Ghi tay' : group.note);
  const kieu = timeStyle(dm, group.bucket, BUCKET_ICON[group.bucket]);

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      {/* Vòng lặp: dòng này gộp nhiều ngày giống nhau. Trước đây là ký tự ↻, mảnh
          đến mức nhìn như một hạt bụi. */}
      <div className="list-icon" style={{ background: '#edeff3', color: kieu.color }}>
        {/* Nhóm vẫn giữ dấu vòng lặp: "gộp nhiều ngày" là thông tin mà hình của danh
            mục không nói được, còn màu thì vẫn lấy của danh mục. */}
        <Icon name={group.golden ? 'flame' : 'repeat'} size={19} />
      </div>
      {/* Cột nội dung. `.list-row` xếp ngang, nên nút và danh sách từng ngày phải nằm
          chung một cột, không thì mở ra là danh sách nhảy sang cạnh nút. */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Cả thân dòng là nút mở. Một nhóm KHÔNG sửa và xoá cả cụm được — nó là 28 mục
            riêng, và "xoá cả nếp" là một câu hỏi khác hẳn "xoá mục hôm thứ ba". Mở ra
            rồi sửa từng ngày. */}
        <button
          type="button"
          className="group-button"
          aria-expanded={open}
          onClick={() => setMo(!open)}
        >
          <div className="row" style={{ alignItems: 'baseline' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {ten}
              <span className={open ? 'group-arrow is-mo' : 'group-arrow'} aria-hidden>
                ›
              </span>
            </div>
            <div
              style={{ fontWeight: 700, color: color, marginLeft: 'auto', whiteSpace: 'nowrap' }}
            >
              {group.deu
                ? fmtMinutes(group.usualMinutes)
                : `${fmtMinutes(group.minMinutes)} – ${fmtMinutes(group.maxMinutes)}`}
            </div>
          </div>

          {/* Nếp cứng vẽ một thanh ở mức thường gặp. Nếp mềm vẽ cả dải: một thanh đơn ở
              đây sẽ ngụ ý một con số chuẩn mà dữ liệu không có. */}
          <div className="bar" style={{ marginTop: 6 }}>
            {group.deu ? (
              <i
                style={{
                  width: `${Math.round((group.usualMinutes * 100) / dungNhat)}%`,
                  background: color,
                }}
              />
            ) : (
              <i
                style={{
                  marginLeft: `${Math.round((group.minMinutes * 100) / dungNhat)}%`,
                  width: `${Math.max(2, Math.round(((group.maxMinutes - group.minMinutes) * 100) / dungNhat))}%`,
                  background: color,
                  opacity: 0.55,
                }}
              />
            )}
          </div>

          <div className="sm" style={{ marginTop: 5 }}>
            {cadenceOf(group)} · {group.times} lần
            {group.deu ? '' : ` · trung bình ${fmtMinutes(group.avgMinutes)}`} · tổng{' '}
            {fmtMinutes(group.totalMinutes)}
          </div>

          {/* Chỉ gọi là "không theo nếp" khi nếp có thật. Nếp mềm thì mọi ngày đều khác
              nhau, và kể tên 17 trên 24 ngày là nói sai. */}
          {group.deu && group.offDays.length > 0 && (
            <div className="off-pattern">
              {group.offDays.length} ngày không theo nếp:{' '}
              {group.offDays
                .slice(0, 3)
                .map((e) => `${labelDay(e.date)} ${fmtMinutes(e.minutes)}`)
                .join(' · ')}
              {group.offDays.length > 3 ? ' …' : ''}
            </div>
          )}

          {!open && <div className="expand-hint">{group.times} ngày, chạm để sửa từng ngày</div>}
        </button>

        {open && (
          <div style={{ marginTop: 6 }}>
            {group.muc.map((e) => (
              <DayInGroup key={e.id} e={e} color={color} group={group} onChanged={onChanged} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Một ngày bên trong nhóm. Sửa và xoá được như mọi mục khác — nó LÀ một mục như thế. */
function DayInGroup({
  e,
  color,
  group,
  onChanged,
}: {
  readonly e: TimeEntry;
  readonly color: string;
  readonly group: EntryGroup;
  readonly onChanged: () => void;
}) {
  const [open, setMo] = useState(false);

  return (
    <div>
      <div className="day-row">
        <span>{labelDay(e.date)}</span>
        <b style={{ color: e.minutes === group.usualMinutes ? 'inherit' : color }}>
          {fmtMinutes(e.minutes)}
        </b>
        <RowActions
          onEdit={() => setMo(!open)}
          editing={open}
          onDelete={async () => {
            await store.deleteTimeEntry(e.id);
            onChanged();
          }}
          question={`Xoá mục ${labelDay(e.date)}?`}
        />
      </div>
      {open && (
        <EditEntry
          e={e}
          onDone={() => {
            setMo(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
