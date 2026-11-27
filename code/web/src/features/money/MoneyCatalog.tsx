import { Link } from 'react-router-dom';
import { MONEY_CELL_LABEL_VI, type MoneyCategory, type MoneyEntry } from '@mira/contract';
import { vnd } from '../../lib/format';
import { catalogOf } from '../../lib/moneyCatalog';
import { Icon } from '../../ui/Icon';
import { MONEY_CELL_ICON } from '../../lib/moneyColors';
import { moneyStyle } from '../../lib/categoryStyle';

/**
 * **Catalog tiền**: mỗi danh mục một dòng, kèm tổng tháng. Bấm vào thì ra chi tiết.
 *
 * Đây là tầng mà bản đầu bỏ sót, và bỏ sót nó thì cả màn vô dụng. Vòng dòng tiền nói
 * *"chi tiêu 900k"*; danh sách phẳng nói *"60k, 55k, 40k…"* ba mươi lần. Câu người ta
 * thật sự hỏi nằm ở giữa: **ăn trưa hết bao nhiêu**.
 *
 * Bày theo đúng concept Founder gửi: biểu tượng tròn, tên đậm, một dòng phụ nhạt, con số
 * bên phải. **Không có thanh tỉ lệ ở đây** — concept không có, và ở màn chính thì thứ
 * cần so là các danh mục với nhau qua con số, không phải chiều dài thanh. Thanh tỉ lệ
 * nằm trong màn chi tiết, nơi người ta đã chọn một ô và đang so bên trong nó.
 *
 * "Đã nhập · 25/11" lấy từ khoản gần nhất thật, không phải mốc bịa. Icon là SVG nét
 * nhuộm theo màu ô — xem `ui/Icon.tsx` để biết vì sao không còn emoji.
 */


/** "2026-11-25" → "25/11". */
const ngayGon = (d: string): string => {
  const [, m, ng] = d.split('-');
  return `${Number(ng)}/${Number(m)}`;
};

export function MoneyCatalog({
  entries,
  categories,
}: {
  readonly entries: readonly MoneyEntry[];
  readonly categories: readonly MoneyCategory[];
}) {
  const catalog = catalogOf(entries, categories);
  if (catalog.length === 0) return null;

  return (
    <>
      {catalog.map((o) => {
        return (
          <div className="card" key={o.cell}>
            <div className="row">
              <div className="label">{MONEY_CELL_LABEL_VI[o.cell]}</div>
              <Link to={`/tai-chinh/${o.cell}`} className="sm">
                {vnd(o.total)} ›
              </Link>
            </div>

            {o.rows.map((r) => {
              // Hình và màu của CHÍNH danh mục này, không phải của ô. Đây là chỗ Money
              // Lover hơn hẳn bản cũ: hai mươi dòng chi tiêu từng là hai mươi cái hoá
              // đơn giống hệt nhau, giờ mỗi dòng mang dấu riêng và quét được bằng mắt.
              const kieu = moneyStyle(
                categories.find((c) => c.id === r.categoryId),
                o.cell,
                MONEY_CELL_ICON[o.cell],
              );
              return (
              <Link
                to={`/tai-chinh/${o.cell}`}
                key={`${o.cell}|${r.categoryId ?? ''}`}
                className="cat-row"
              >
                <div className="cat-row__icon" style={{ color: kieu.color }}>
                  <Icon name={kieu.icon} size={19} />
                </div>
                <div className="cat-row__giua">
                  <div className="cat-row__name">{r.name}</div>
                  {/* Số lần nói một chuyện khác với tổng: 1,2tr trong 20 lần là ăn trưa,
                      1,2tr trong 1 lần là một cái gì khác hẳn. */}
                  <div className="sm">
                    {r.count} lần · đã nhập {ngayGon(r.lastDate)}
                  </div>
                </div>
                <b style={{ color: kieu.color }}>{vnd(r.total)}</b>
              </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
