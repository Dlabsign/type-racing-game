import React from 'react';

interface RunnerSvgProps {
  color: string;
  bibNum?: string;
  isPlayer?: boolean;
  hasSpeedBurst?: boolean;
  className?: string;
}

export const RunnerSvg: React.FC<RunnerSvgProps> = ({
  color,
  bibNum = '01',
  isPlayer = false,
  hasSpeedBurst = false,
  className
}) => {
  const jerseyColor = color;
  const shoeColor = '#FFFFFF';
  const headbandColor = isPlayer ? '#CCFF00' : '#E2E8F0';
  const isVolt = color.toLowerCase() === '#ccff00' || color.toLowerCase() === '#d4ff00';
  const bibTextColor = isVolt ? '#050811' : '#0F172A';
  const bibBgColor = '#FFFFFF';

  const defaultClasses = `w-[clamp(38px,6vw,72px)] h-[clamp(38px,6vw,72px)] md:w-[clamp(48px,5vw,58px)] md:h-[clamp(48px,5vw,58px)] lg:w-[clamp(62px,5vw,74px)] lg:h-[clamp(62px,5vw,74px)] overflow-visible transition-all duration-200 ${
    hasSpeedBurst
      ? 'drop-shadow-[0_0_24px_rgba(204,255,0,0.85)]'
      : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
  }`;

  return (
    <svg className={className || defaultClasses} viewBox="0 0 100 85">
      {/* Speed Burst Radiant Core Glow */}
      {hasSpeedBurst && (
        <g className="animate-pulse">
          <ellipse cx="48" cy="45" rx="36" ry="28" fill="#CCFF00" opacity="0.22" />
          <ellipse cx="48" cy="45" rx="24" ry="18" fill="#FFFFFF" opacity="0.3" />
        </g>
      )}

      {/* High-Speed Dynamic Air Trails */}
      <g
        className="speed-trails"
        stroke={hasSpeedBurst ? '#CCFF00' : isPlayer ? '#CCFF00' : '#FFFFFF'}
        strokeLinecap="round"
        opacity={hasSpeedBurst ? 0.95 : 0.75}
      >
        <line x1={hasSpeedBurst ? -35 : -20} y1="26" x2="8" y2="26" strokeWidth={hasSpeedBurst ? 3.5 : 2.2} />
        <line x1={hasSpeedBurst ? -48 : -28} y1="40" x2="6" y2="40" strokeWidth={hasSpeedBurst ? 4.2 : 2.6} />
        <line x1={hasSpeedBurst ? -30 : -16} y1="54" x2="12" y2="54" strokeWidth={hasSpeedBurst ? 3.5 : 2} />
        {hasSpeedBurst && (
          <>
            <line x1="-40" y1="18" x2="14" y2="18" strokeWidth="2.5" stroke="#FFFFFF" />
            <line x1="-36" y1="62" x2="10" y2="62" strokeWidth="2.5" stroke="#CCFF00" />
          </>
        )}
      </g>

      {/* Ground Contact Shadow */}
      <ellipse cx="48" cy="78" rx="22" ry="4" fill="rgba(0,0,0,0.45)" />

      {/* Main Animated Biomechanical Sprinter Rig */}
      <g className="runner-body-group" style={{ transformOrigin: '47px 50px' }}>
        {/* 1. BACK ARM */}
        <g className="arm-back" style={{ transformOrigin: '46px 31px' }}>
          <path d="M46 31 L32 42 L23 34" fill="none" stroke="#05070a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M46 31 L32 42 L23 34" fill="none" stroke="#f6c29e" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* 2. BACK LEG (Hierarchical Chain: Hip -> Thigh -> Knee -> Calf -> Ankle -> Spike Shoe) */}
        <g className="thigh-back" style={{ transformOrigin: '45px 50px' }}>
          {/* Back Thigh */}
          <line x1="45" y1="50" x2="32" y2="59" stroke="#05070a" strokeWidth="8" strokeLinecap="round" />
          <line x1="45" y1="50" x2="32" y2="59" stroke="#f6c29e" strokeWidth="4.8" strokeLinecap="round" />
          {/* Back Knee Joint & Calf */}
          <g className="calf-back" style={{ transformOrigin: '32px 59px' }}>
            <line x1="32" y1="59" x2="19" y2="64" stroke="#05070a" strokeWidth="7.5" strokeLinecap="round" />
            <line x1="32" y1="59" x2="19" y2="64" stroke="#f6c29e" strokeWidth="4.5" strokeLinecap="round" />
            {/* Back Spike Shoe */}
            <polygon points="13,61 23,61 21,68 12,66" fill={shoeColor} stroke="#05070a" strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        </g>

        {/* 3. TORSO (Aggressive Forward Lean Athletic Jersey) */}
        <polygon points="39,27 58,29 55,50 37,48" fill={jerseyColor} stroke="#05070a" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Athletic Bib Plate */}
        <rect x="42" y="32" width="12" height="11" rx="1.5" fill={bibBgColor} stroke="#05070a" strokeWidth="1.2" />
        <text x="48" y="41" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fontWeight="800" textAnchor="middle" fill={bibTextColor}>
          {bibNum}
        </text>

        {/* Athletic Running Shorts */}
        <polygon points="36,47 56,47 59,57 48,58 46,53 35,56" fill="#05070a" stroke="#05070a" strokeWidth="2" strokeLinejoin="round" />

        {/* 4. FRONT LEG (Hierarchical Chain: Hip -> Thigh -> Knee -> Calf -> Ankle -> Spike Shoe) */}
        <g className="thigh-front" style={{ transformOrigin: '49px 50px' }}>
          {/* Front Thigh */}
          <line x1="49" y1="50" x2="62" y2="59" stroke="#05070a" strokeWidth="8" strokeLinecap="round" />
          <line x1="49" y1="50" x2="62" y2="59" stroke="#f6c29e" strokeWidth="4.8" strokeLinecap="round" />
          {/* Front Knee Joint & Calf */}
          <g className="calf-front" style={{ transformOrigin: '62px 59px' }}>
            <line x1="62" y1="59" x2="57" y2="72" stroke="#05070a" strokeWidth="7.5" strokeLinecap="round" />
            <line x1="62" y1="59" x2="57" y2="72" stroke="#f6c29e" strokeWidth="4.5" strokeLinecap="round" />
            {/* Front Spike Shoe */}
            <polygon points="52,70 66,71 63,77 50,76" fill={shoeColor} stroke="#05070a" strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        </g>

        {/* 5. FRONT ARM */}
        <g className="arm-front" style={{ transformOrigin: '51px 31px' }}>
          <path d="M51 31 L66 41 L74 32" fill="none" stroke="#05070a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M51 31 L66 41 L74 32" fill="none" stroke="#f6c29e" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* 6. HEAD & SPEED GLASSES */}
        <circle cx="53" cy="17" r="10" fill="#f6c29e" stroke="#05070a" strokeWidth="2" />
        {/* Athletic Headband */}
        <path d="M44 13 C48 10 58 10 63 14" stroke={headbandColor} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        {/* Aerodynamic Speed Sunglasses */}
        <polygon points="51,16 63,17 65,21 53,21" fill="#05070a" stroke={isPlayer ? '#CCFF00' : '#FFFFFF'} strokeWidth="0.8" />
      </g>
    </svg>
  );
};
