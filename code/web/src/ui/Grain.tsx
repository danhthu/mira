import type { MomentKind } from '@mira/contract';

/**
 * Hai hình, hai nhiệt độ màu. Viên kẹo bầu và dài, màu vàng ấm; hạt muối vuông cạnh,
 * màu xanh nguội. Nhìn hũ là biết tháng vừa rồi mặn tới đâu, không cần đếm.
 */
export function Grain({ kind }: { readonly kind: MomentKind }) {
  const candy = kind === 'candy';
  return (
    <span
      aria-label={candy ? 'viên kẹo' : 'hạt muối'}
      style={{
        width: candy ? 16 : 10,
        height: 10,
        borderRadius: candy ? 6 : 2,
        background: candy ? 'var(--candy)' : 'var(--salt)',
        flex: 'none',
      }}
    />
  );
}

export function Jar({ kinds }: { readonly kinds: readonly MomentKind[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        marginTop: 11,
      }}
    >
      {kinds.map((kind, index) => (
        <Grain key={index} kind={kind} />
      ))}
    </div>
  );
}
