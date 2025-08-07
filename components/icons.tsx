
import React from 'react';

export const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export const BotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const VideoPlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5v-9l7 4.5-7 4.5z"/>
    </svg>
);

export const TelegramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l15.97-5.85c.73-.27 1.36.17 1.15.94l-3.32 15.21c-.23.95-1.22 1.18-1.8.74l-4.52-3.38-2.14 2.05c-.23.23-.42.41-.69.41z"/>
    </svg>
);

export const RobotBgIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} fill="currentColor" aria-hidden="true">
        <path d="M224,115.55V184a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a64.12,64.12,0,0,1,5-25.22L54.64,48h146.72l17.65,42.33A64.12,64.12,0,0,1,224,115.55ZM184,80H72L60.29,107.49a48.16,48.16,0,0,0-4.24,18.92V184H200V126.41a48.16,48.16,0,0,0-4.24-18.92ZM104,144a12,12,0,1,0-12-12A12,12,0,0,0,104,144Zm48,0a12,12,0,1,0-12-12A12,12,0,0,0,152,144Z"/>
    </svg>
);
