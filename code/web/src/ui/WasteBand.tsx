import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { WasteTrend } from '../lib/waste';

/**
 * Dải Lãng phí: một nút to, màu hổ phách, dẫn vào danh sách từng mục lãng phí.
 *
 * 27/11/2026, theo ý Founder: lãng phí là phần người dùng TỐI ƯU được, nên nó không được
 * nằm lẫn làm một dòng chú thích của vòng tròn. Dải nói ba điều: bao nhiêu, chiếm cỡ nào,
 * và phần lớn là gì — rồi chạm vào để xem từng mục.
 *
 * Không đỏ: Mira không doạ người dùng vì một buổi lướt điện thoại.
 */
export function WasteBand({
  to,
  title,
  value,
  share,
  top,
  empty,
  trend = null,
}: {
  readonly to: string;
  readonly title: string;
  /** null khi chưa ghi gì: dải vẫn hiện, để người ta biết chỗ này có. */
  readonly value: string | null;
  readonly share: string | null;
  readonly top: readonly { readonly name: string; readonly value: string }[];
  readonly empty: string;
  readonly trend?: WasteTrend | null;
}) {
  return (
    <Link to={to} className="phi-band">
      <div className="phi-band__dau">
        <Icon name="hourglass" size={19} />
        <span>{title}</span>
        <b>{value ?? '—'}</b>
        <i className="phi-band__toi" aria-hidden>
          ›
        </i>
      </div>
      {value === null ? (
        <div className="phi-band__chu">{empty}</div>
      ) : (
        <>
          {top.length > 0 && (
            <div className="phi-band__top">
              {top.map((t) => (
                <div key={t.name} className="phi-band__dong">
                  <span>{t.name}</span>
                  <b>{t.value}</b>
                </div>
              ))}
            </div>
          )}
          {trend !== null && (
            <div
              className={`phi-band__xu${trend.good === true ? ' phi-band__xu--tot' : trend.good === false ? ' phi-band__xu--xau' : ''}`}
            >
              {trend.text}
            </div>
          )}
          <div className="phi-band__chu">
            {share === null ? '' : `${share} · `}Chạm để xem từng mục
          </div>
        </>
      )}
    </Link>
  );
}
