import { Link } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';

export interface DonutPart {
  readonly color: string;
  readonly value: number;
}

export interface DonutProps {
  readonly parts: readonly DonutPart[];
  readonly size?: number;
  readonly children?: ReactNode;
}

/**
 * Donut bằng conic-gradient và mask — không kéo thư viện biểu đồ vào cho một vòng tròn.
 *
 * Phần còn thiếu so với tổng được để màu nền: người dùng phải thấy phần mình chưa ghi,
 * nên vòng tròn không tự giãn cho đủ 100%.
 */
export function Donut({ parts, size = 148, children }: DonutProps) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const scale = total === 0 ? 0 : 100 / Math.max(total, 100);

  let cursor = 0;
  const stops: string[] = [];
  for (const part of parts) {
    const span = part.value * scale;
    if (span <= 0) continue;
    stops.push(`${part.color} ${cursor}% ${cursor + span}%`);
    cursor += span;
  }
  if (cursor < 100) {
    stops.push(`var(--line) ${cursor}% 100%`);
  }

  const hole = size * 0.29;
  const ring: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `conic-gradient(${stops.join(', ')})`,
    WebkitMaskImage: `radial-gradient(circle, transparent ${hole}px, #000 ${hole + 1}px)`,
    maskImage: `radial-gradient(circle, transparent ${hole}px, #000 ${hole + 1}px)`,
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <div style={ring} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface LegendRow {
  readonly color: string;
  readonly label: string;
  readonly value: string;
  readonly valueColor?: string;
  /** Có `to` thì dòng này mở ra màn chi tiết; không có thì nó chỉ là chữ. */
  readonly to?: string;
}

export function Legend({ rows }: { readonly rows: readonly LegendRow[] }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingLeft: 11,
        minWidth: 0,
      }}
    >
      {rows.map((row) => {
        const noiDung = (
          <>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: row.color,
                flex: 'none',
              }}
            />
            {row.label}
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: row.valueColor }}>
              {row.value}
            </span>
            {row.to !== undefined && (
              <span style={{ color: 'var(--fg-faint)', marginLeft: 4 }}>›</span>
            )}
          </>
        );

        const o = {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13.5,
          whiteSpace: 'nowrap',
          color: 'inherit',
        } as const;

        return row.to === undefined ? (
          <div key={row.label} style={o}>
            {noiDung}
          </div>
        ) : (
          <Link key={row.label} to={row.to} style={o}>
            {noiDung}
          </Link>
        );
      })}
    </div>
  );
}
