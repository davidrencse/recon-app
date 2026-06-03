import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#131313',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <line x1="24" y1="78" x2="24" y2="24"/>
          <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
          <line x1="38" y1="60" x2="74" y2="80"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
