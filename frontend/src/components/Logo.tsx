import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    {/* 4 Diagonal Feeder Lines */}
    <line x1="8" y1="12" x2="24" y2="24" stroke="#356A88" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="8" y1="52" x2="24" y2="40" stroke="#C6533C" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="44" y1="12" x2="36" y2="20" stroke="#356A88" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="44" y1="52" x2="36" y2="44" stroke="#C6533C" strokeWidth="4.5" strokeLinecap="round" />
    {/* Central Diamond Lens */}
    <polygon points="24,32 32,24 40,32 32,40" fill="#102B42" stroke="#356A88" strokeWidth="3.5" strokeLinejoin="round" />
    <polygon points="29,32 32,29 35,32 32,35" fill="#F1EDE4" />
    {/* Reconciled Outcome Line */}
    <line x1="40" y1="32" x2="58" y2="32" stroke="#3E725E" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);
