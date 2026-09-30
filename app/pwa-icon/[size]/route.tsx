import { ImageResponse } from 'next/og';

/**
 * R17 P2-10: Android "Add to Home Screen" / install wants 192 px and 512 px icons; the manifest only had the 32 px tab
 * icon and the 180 px Apple icon, so the home-screen tile was blurry. Same drawing as app/icon.tsx, scaled.
 * Pre-rendered at build time for the two sizes only.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

const SIZES = ['192', '512'] as const;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = Number(size);
  return new ImageResponse(
    <div
      style={{
        background: '#F5C400',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Math.round(px / 4),
        color: '#0A0A0A',
        fontSize: Math.round(px * 0.62),
        fontWeight: 900,
        fontFamily: 'sans-serif',
      }}
    >
      H
    </div>,
    { width: px, height: px },
  );
}
