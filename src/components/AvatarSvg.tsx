import React from 'react';

interface AvatarSvgProps {
  runnerId: string;
  className?: string;
}

const configs: Record<string, { shirt: string; hair: string; skin: string; ponytail: boolean }> = {
  player: { shirt: '#49c63a', hair: '#1e242b', skin: '#f5b994', ponytail: false },
  rival1: { shirt: '#2183df', hair: '#5c3317', skin: '#f3b48c', ponytail: false },
  rival2: { shirt: '#f0b429', hair: '#63371a', skin: '#f6be9a', ponytail: true  },
  rival3: { shirt: '#7b4fe0', hair: '#252336', skin: '#f2b28d', ponytail: false }
};

export const AvatarSvg: React.FC<AvatarSvgProps> = ({ runnerId, className = "w-8 h-8 sm:w-10 sm:h-10 shrink-0 drop-shadow" }) => {
  const c = configs[runnerId] || configs.player;

  return (
    <svg className={className} viewBox="0 0 48 48">
      {c.ponytail && (
        <path d="M12 18 Q5 20 7 28 Q11 26 14 22 Z" fill={c.hair} stroke="#141414" strokeWidth="2" />
      )}
      {/* Shoulders / Shirt */}
      <path d="M10 44 C10 34 38 34 38 44 Z" fill={c.shirt} stroke="#141414" strokeWidth="2.2" />
      {/* Neck */}
      <rect x="20" y="29" width="8" height="6" rx="2" fill={c.skin} stroke="#141414" strokeWidth="2" />
      {/* Head */}
      <circle cx="24" cy="21" r="10.5" fill={c.skin} stroke="#141414" strokeWidth="2.2" />
      {/* Hair */}
      <path
        d="M13 20 C12 11 20 7 28 9 C35 10 37 16 35 20 C32 16 27 15 22 16 C18 17 15 18 13 20 Z"
        fill={c.hair}
        stroke="#141414"
        strokeWidth="2"
      />
      {/* Eyes & Smile */}
      <circle cx="21" cy="21" r="1.5" fill="#141414" />
      <circle cx="28" cy="21" r="1.5" fill="#141414" />
      <path d="M21 25.5 Q24.5 28 28 25.5" fill="none" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};
