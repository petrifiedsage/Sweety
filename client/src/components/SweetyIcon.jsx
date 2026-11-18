import React from 'react';

export default function SweetyIcon({ className = 'h-9 w-9' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 192 192"
      role="img"
      aria-label="Sweety logo"
      className={className}
    >
      <defs>
        <linearGradient id="sweety-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#27B7AE" />
          <stop offset="1" stopColor="#168D91" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="176" height="176" rx="48" fill="url(#sweety-teal)" />
      <rect x="35" y="34" width="122" height="94" rx="20" fill="#F7FFFE" />
      <path
        d="M51 96 L73 96 L86 76 L103 108 L119 86 L141 86"
        fill="none"
        stroke="#183B4E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="58" cy="150" r="7" fill="#FF8A80" />
      <circle cx="96" cy="150" r="7" fill="#FF8A80" />
      <circle cx="134" cy="150" r="7" fill="#FF8A80" />
      <path
        d="M70 169 Q96 181 122 169"
        fill="none"
        stroke="#D9F5F1"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
