import { Link } from 'react-router-dom';
import { BUCKET_LABEL_VI, type Category, type TimeEntry } from '@mira/contract';
import { minutes as fmtMinutes } from '../../lib/format';
import { catalogOf } from '../../lib/timeCatalog';
import { BUCKET_ICON } from '../../lib/bucketColors';
import { Icon } from '../../ui/Icon';
import { timeStyle } from '../../lib/categoryStyle';

/**
 * **Catalog giờ**: mỗi danh mục một dòng, kèm tổng tuần. Bấm vào thì ra chi tiết.
 *
 * Bản sao của `MoneyCatalog`, cố ý giống tới từng dòng. Màn Thời gian trước đây nhảy
 * thẳng từ donut xuống *"ghi gần đây"* — sáu mục lẻ. Giữa hai cái đó thiếu đúng câu người
 * ta hỏi: **tuần này họp mất mấy giờ**, **điện thoại ăn mất bao nhiêu**.
 *
 * Donut nói *"công việc 89%"*. Danh sách phẳng nói *"8h, 2h, 8h…"*. Không cái nào trả lời
 * được.
 *
 * **Không có thanh tỉ lệ ở đây** — cùng lý do với bên tiền: ở màn chính thứ cần so là các
 * danh mục qua con số, và thanh tỉ lệ nằm trong màn chi tiết, nơi người ta đã chọn một
 * nhóm và đang so bên trong nó.
 */


/** "2026-11-25" → "25/11". */
const ngayGon = (d: string): string => {
  const [, m, ng] = d.split('-');
  return `${Number(ng)}/${Number(m)}`;
};

export function TimeCatalog({
  entries,
  categories,
}: {
  readonly entries: readonly TimeEntry[];
  readonly categories: readonly Category[];
}) {
  const catalog = catalogOf(entries, categories);
  if (catalog.length === 0) return null;

  return (
    <>
      {catalog.map((o) => {
        return (
          <div className="card" key={o.cell}>
            <div className="row">
              <div className="label">{BUCKET_LABEL_VI[o.cell]}</div>
              <Link to={`/thoi-gian/${o.cell}`} className="sm">
                {fmtMinutes(o.total)} ›
              </Link>
            </div>

            {o.rows.map((r) => {
              // Hình và màu của CHÍNH danh mục này, rơi về hình của nhóm việc khi chưa
              // chọn. Tính một lần cho mỗi dòng — `o.cell` đã nằm ngay đây, không phải
              // dò lại cả catalog.
              const kieu = timeStyle(
                categories.find((c) => c.id === r.categoryId),
                o.cell,
                BUCKET_ICON[o.cell],
              );
              return (
              <Link
                to={`/thoi-gian/${o.cell}`}
                key={`${o.cell}|${r.categoryId ?? ''}`}
                className="cat-row"
              >
                <div className="cat-row__icon" style={{ color: kieu.color }}>
                  <Icon name={kieu.icon} size={19} />
                </div>
                <div className="cat-row__giua">
                  <div className="cat-row__name">{r.name}</div>
                  {/* Số lần nói một chuyện khác với tổng: 8 giờ trong 1 lần là một ngày
                      làm việc, 8 giờ trong 20 lần là hai mươi lần bị cắt ngang. */}
                  <div className="sm">
                    {r.count} lần · ghi gần nhất {ngayGon(r.lastDate)}
                  </div>
                </div>
                <b style={{ color: kieu.color }}>{fmtMinutes(r.total)}</b>
              </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
