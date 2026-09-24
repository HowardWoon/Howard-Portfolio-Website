import type { CSSProperties } from 'react';

/** One Bauhaus confetti piece: 0 = circle, 1 = square, 2 = triangle. Ink outline, pop fill. */
export function BauhausPiece({
  kind,
  size,
  color,
  style,
}: {
  kind: 0 | 1 | 2;
  size: number;
  color: string;
  style?: CSSProperties;
}) {
  if (kind === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style} className="block overflow-visible">
        <polygon points="50,6 96,92 4,92" fill={color} stroke="#0A0A0A" strokeWidth="10" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <span
      className="block border-2 border-ink"
      style={{ width: size, height: size, background: color, borderRadius: kind === 0 ? 9999 : 3, ...style }}
    />
  );
}
