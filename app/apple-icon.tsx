import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#F5C400',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        color: '#0A0A0A',
        fontSize: 112,
        fontWeight: 900,
        fontFamily: 'sans-serif',
      }}
    >
      H
    </div>,
    {
      ...size,
    },
  );
}
