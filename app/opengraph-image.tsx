import { ImageResponse } from 'next/og';

export const alt = 'Howard Woon // Systems & AI Architect';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Social card re-skinned to the Neo-Brutalist / Bauhaus identity (white canvas, ink borders, primary blocks)
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#FFF7E0',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -80,
          top: -80,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: '#2B4BFF',
          border: '8px solid #0A0A0A',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 90,
          bottom: 60,
          width: 110,
          height: 110,
          background: '#FF4B2B',
          border: '8px solid #0A0A0A',
          transform: 'rotate(12deg)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 28,
          background: '#FFFFFF',
          border: '8px solid #0A0A0A',
          borderRadius: 36,
          boxShadow: '16px 16px 0 0 #0A0A0A',
          padding: '56px 72px',
        }}
      >
        <div style={{ display: 'flex', color: '#0A0A0A', fontSize: 84, fontWeight: 900, letterSpacing: '-0.04em' }}>
          HOWARD WOON
          <span style={{ color: '#FF4B2B', marginLeft: 8 }}>.</span>
        </div>
        <div
          style={{
            display: 'flex',
            color: '#0A0A0A',
            background: '#FFC700',
            border: '6px solid #0A0A0A',
            borderRadius: 16,
            padding: '10px 22px',
            fontSize: 34,
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
          }}
        >
          SYSTEMS & AI ARCHITECT
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#0A0A0A',
            fontSize: 26,
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{ width: 22, height: 22, borderRadius: 999, background: '#3DDC97', border: '4px solid #0A0A0A' }}
          />
          AVAILABLE FOR HIRE 2026
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
