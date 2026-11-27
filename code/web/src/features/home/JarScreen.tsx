import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Moment, MomentKind } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, today } from '../../lib/date';
import { Grain, Jar } from '../../ui/Grain';
import { oldGrainCaption, oldGrainRange, pickOldGrain } from '../../lib/oldGrain';
import { DueSalt } from './DueSalt';
import { RowActions } from '../../ui/RowActions';

/**
 * Chi tiết hũ. Trang chủ chỉ hiện cái hũ và hai con số; chỗ đọc lại từng hạt là đây.
 *
 * Xếp mới nhất lên trên, gom theo tháng.
 *
 * ──────────────── SỬA VÀ XOÁ ĐƯỢC — ĐẢO LẠI LUẬT CŨ, CÓ LÝ DO ────────────────
 *
 * File này từng ghi: *"Không có nút xoá: hạt đã bỏ vào hũ thì ở đó, vì một cuốn nhật ký
 * sửa được là một cuốn nhật ký không tin được."* Luật ấy đúng khi hạt chỉ do **người
 * dùng tự bấm** mà có.
 *
 * Từ 25/11/2026 **chat tự ghi hạt**. Một câu đọc nhầm cảm xúc bỏ hạt vào sai hũ, và hai
 * con số trên trang chủ là đếm theo hũ. Giữ nguyên luật cũ thì cái sai của MÁY trở thành
 * lịch sử không gỡ được của NGƯỜI — đó mới là thứ làm cuốn sổ hết đáng tin.
 *
 * Nên còn đúng một chỗ khoá: **hạt muối đã trả lời câu hỏi lại sau 42 ngày**. Lúc đó
 * người dùng đã tự nói một câu về quá khứ của mình, và máy chủ từ chối ghi đè.
 */
const DAY_COUNT = 365;

export function JarScreen() {
  const day = today();
  const [cuTu, cuDen] = oldGrainRange(day);
  const state = useAsync(async () => store.listMoments(addDays(day, -DAY_COUNT), day), [day]);

  const hat = [...(state.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  // Hai thứ kéo người ta quay lại, tải riêng để một cái hỏng không kéo sập cả hũ.
  const due = useAsync(() => store.momentsDue(day), [day]);
  const hatCu = pickOldGrain(hat.filter((m) => m.date >= cuTu && m.date <= cuDen));
  const keo = hat.filter((m) => m.kind === 'candy').length;
  const muoi = hat.length - keo;

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Hũ</div>
        <Link to="/toi" className="sm">
          Tôi ›
        </Link>
      </div>

      <DueSalt
        due={due.data ?? []}
        onAnswered={() => {
          due.reload();
          state.reload();
        }}
      />

      {hatCu !== null && (
        <div className="cu">
          <div className="cu__k">{oldGrainCaption(hatCu.date, day)}</div>
          <p className="cu__t">“{hatCu.text}”</p>
        </div>
      )}

      <div className="card">
        <div className="row">
          <div>
            <div className="big">{hat.length}</div>
            <div className="sm" style={{ marginTop: 4 }}>
              hạt trong một năm
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--candy)' }}>{keo} kẹo</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--salt)', marginTop: 4 }}>
              {muoi} muối
            </div>
          </div>
        </div>
        {hat.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <Jar kinds={hat.slice(0, 60).map((m) => m.kind)} />
          </div>
        )}
      </div>

      {state.loading && <p className="empty">Đang mở hũ…</p>}

      {!state.loading && hat.length === 0 && (
        <p className="empty">
          Hũ còn trống. Gõ một dòng về hôm nay ở Nhật ký, vui hay nặng đều được, là có hạt đầu tiên.
        </p>
      )}

      {Object.entries(groupByMonth(hat)).map(([thang, inMonth]) => (
        <div key={thang}>
          <div className="label" style={{ marginTop: 14, marginBottom: 10 }}>
            {monthLabel(thang)}
          </div>
          {/* Mỗi tháng một khung, không phải cả hũ một khung: nhãn tháng nằm giữa hai
              khung thì nó mới ngắt được danh sách, còn nằm trong khung thì nó chìm. */}
          <div className="list">
            {inMonth.map((m) => (
              <GrainRow key={m.id} m={m} onChanged={state.reload} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Một hạt trong hũ. Sửa chữ, đổi kẹo ↔ muối, hoặc xoá hẳn. */
function GrainRow({ m, onChanged }: { readonly m: Moment; readonly onChanged: () => void }) {
  const [open, setMo] = useState(false);
  // Hạt muối đã trả lời thì khoá: máy chủ từ chối PATCH, nên đừng mời người ta bấm Sửa
  // rồi nhận một lỗi. Vẫn xoá được — xoá là bỏ cả hạt lẫn câu trả lời, không phải ghi đè.
  const khoa = m.revisitAnswer !== null && m.revisitAnswer !== undefined;

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      <div className="list-icon" style={{ background: '#edeff3' }}>
        <Grain kind={m.kind} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, lineHeight: 1.45 }}>
          {m.text === null || m.text.trim() === '' ? (
            <span className="sm">Không ghi chữ nào</span>
          ) : (
            m.text
          )}
        </div>
        <div className="row-foot" style={{ marginTop: 3 }}>
          <div className="sm" style={{ minWidth: 0 }}>
            {labelDay(m.date)}
            {khoa ? ` · ${REVISIT_ANSWER_VI[m.revisitAnswer as string] ?? ''}` : ''}
          </div>
          <RowActions
            onEdit={khoa ? undefined : () => setMo(!open)}
            editing={open}
            onDelete={async () => {
              await store.deleteMoment(m.id);
              onChanged();
            }}
            question="Xoá hẳn hạt này?"
          />
        </div>

        {open && (
          <EditGrain
            m={m}
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

/** Sửa chữ của một hạt, và đổi nó sang hũ kia. */
function EditGrain({ m, onDone }: { readonly m: Moment; readonly onDone: () => void }) {
  const [text, setText] = useState(m.text ?? '');
  const [kind, setKind] = useState<MomentKind>(m.kind);
  const [busy, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const newText = text.trim() === '' ? null : text.trim();
  const changed = newText !== m.text || kind !== m.kind;

  async function save(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await store.updateMoment(m.id, { text: newText, kind });
      onDone();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
      setDangChay(false);
    }
  }

  return (
    <div className="edit">
      <div className="pills pills--small">
        {(['candy', 'salt'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === 'candy' ? 'Kẹo' : 'Muối'}
          </button>
        ))}
      </div>

      <input
        className="edit__text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Hôm đó thế nào?"
        aria-label="Chữ của hạt"
      />

      {/* Đổi kẹo → muối là đặt một cái hẹn hỏi lại sau 42 ngày, tính từ ngày của hạt.
          Nói ra, vì đó là một việc app sẽ làm trong tương lai mà người bấm không thấy. */}
      {kind !== m.kind && (
        <p className="sm" style={{ marginTop: 8, lineHeight: 1.5 }}>
          {kind === 'salt'
            ? 'Thành hạt muối thì Mira sẽ hỏi lại sau 42 ngày kể từ ngày của hạt.'
            : 'Thành hạt kẹo thì bỏ luôn hẹn hỏi lại.'}
        </p>
      )}

      <div className="edit__row" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="edit__save"
          style={{ marginLeft: 0 }}
          disabled={busy || !changed}
          onClick={() => void save()}
        >
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}
    </div>
  );
}

const REVISIT_ANSWER_VI: Record<string, string> = {
  same: 'vẫn vậy',
  lighter: 'nhẹ hơn rồi',
  gone: 'qua rồi',
};

function groupByMonth(hat: readonly Moment[]): Record<string, Moment[]> {
  const ra: Record<string, Moment[]> = {};
  for (const m of hat) {
    const thang = m.date.slice(0, 7);
    (ra[thang] ??= []).push(m);
  }
  return ra;
}

function monthLabel(thang: string): string {
  const [nam, thg] = thang.split('-');
  return `Tháng ${Number(thg)}/${nam}`;
}
