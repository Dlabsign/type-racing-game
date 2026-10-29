import React from 'react';

export const StadiumPerspectiveBg: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Obsidian Speed Sky Gradient */}
          <linearGradient id="skyGrad" x1="720" y1="0" x2="720" y2="570" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#050811" />
            <stop offset="60%" stopColor="#0B101D" />
            <stop offset="100%" stopColor="#10172A" />
          </linearGradient>

          {/* Deep Obsidian Carbon Track Gradient */}
          <linearGradient id="trackObsidianGrad" x1="720" y1="570" x2="720" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A0E1A" />
            <stop offset="35%" stopColor="#070B14" />
            <stop offset="70%" stopColor="#050811" />
            <stop offset="100%" stopColor="#03050A" />
          </linearGradient>

          {/* Volt Neon Horizon Glow */}
          <linearGradient id="horizonVoltHaze" x1="720" y1="520" x2="720" y2="620" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#050811" stopOpacity="0" />
          </linearGradient>

          {/* Grandstand Roof Gradient */}
          <linearGradient id="roofGradLeft" x1="0" y1="200" x2="300" y2="570" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="roofGradRight" x1="1440" y1="200" x2="1140" y2="570" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* 1. Deep Obsidian Stadium Sky */}
        <rect width="1440" height="580" fill="url(#skyGrad)" />

        {/* Floodlight Beam Cones */}
        <g opacity="0.15">
          <polygon points="120,80 0,550 480,550" fill="url(#skyGrad)" />
          <polygon points="1320,80 960,550 1440,550" fill="url(#skyGrad)" />
        </g>

        {/* Distant Stadium Horizon Line & Canopy Roof Silhouettes */}
        <path
          d="M0 450 L340 500 L560 540 L720 550 L880 540 L1100 500 L1440 450 L1440 575 L0 575 Z"
          fill="#1E293B"
          opacity="0.65"
        />

        {/* Left Grandstand Stadium Structure */}
        <polygon points="0,150 280,320 220,530 0,550" fill="url(#roofGradLeft)" opacity="0.9" />
        <polygon points="0,150 280,320 270,335 0,170" fill="#334155" />
        <line x1="80" y1="200" x2="80" y2="540" stroke="#334155" strokeWidth="4" opacity="0.5" />
        <line x1="180" y1="260" x2="180" y2="535" stroke="#334155" strokeWidth="4" opacity="0.5" />
        <polygon points="0,380 200,430 180,550 0,560" fill="#1E293B" opacity="0.75" />

        {/* Right Grandstand Stadium Structure */}
        <polygon points="1440,150 1160,320 1220,530 1440,550" fill="url(#roofGradRight)" opacity="0.9" />
        <polygon points="1440,150 1160,320 1170,335 1440,170" fill="#334155" />
        <line x1="1360" y1="200" x2="1360" y2="540" stroke="#334155" strokeWidth="4" opacity="0.5" />
        <line x1="1260" y1="260" x2="1260" y2="535" stroke="#334155" strokeWidth="4" opacity="0.5" />
        <polygon points="1440,380 1240,430 1260,550 1440,560" fill="#1E293B" opacity="0.75" />

        {/* 2. Deep Obsidian Running Track (Perspective) */}
        <rect x="0" y="565" width="1440" height="335" fill="url(#trackObsidianGrad)" />

        {/* Perspective White Lane Markings Converging to Horizon Point (720, 565) */}
        <g stroke="#FFFFFF" strokeWidth="3.5" opacity="0.45">
          <line x1="480" y1="565" x2="-140" y2="900" strokeWidth="5" />
          <line x1="560" y1="565" x2="140" y2="900" strokeWidth="4" />
          <line x1="630" y1="565" x2="420" y2="900" strokeWidth="3.5" />
          <line x1="690" y1="565" x2="680" y2="900" strokeWidth="3" />
          <line x1="750" y1="565" x2="760" y2="900" strokeWidth="3" />
          <line x1="810" y1="565" x2="1020" y2="900" strokeWidth="3.5" />
          <line x1="880" y1="565" x2="1300" y2="900" strokeWidth="4" />
          <line x1="960" y1="565" x2="1580" y2="900" strokeWidth="5" />
        </g>

        {/* Horizon Atmospheric Glow and Mist */}
        <rect x="0" y="520" width="1440" height="80" fill="url(#horizonVoltHaze)" />
      </svg>
    </div>
  );
};
