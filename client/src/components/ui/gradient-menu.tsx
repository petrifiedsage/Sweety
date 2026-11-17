import React from 'react';
import {
  IoHomeOutline,
  IoVideocamOutline,
  IoCameraOutline,
  IoShareSocialOutline,
  IoHeartOutline,
} from 'react-icons/io5';

export interface GradientMenuItem {
  title: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  active?: boolean;
  onClick?: () => void;
}

interface GradientMenuProps {
  items?: GradientMenuItem[];
  className?: string;
}

const defaultMenuItems: GradientMenuItem[] = [
  { title: 'Home', icon: <IoHomeOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Video', icon: <IoVideocamOutline />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Photo', icon: <IoCameraOutline />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Share', icon: <IoShareSocialOutline />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Tym', icon: <IoHeartOutline />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' },
];

export default function GradientMenu({
  items = defaultMenuItems,
  className = '',
}: GradientMenuProps) {
  return (
    <ul className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {items.map(({ title, icon, gradientFrom, gradientTo, active, onClick }, idx) => (
        <li key={idx}>
          <button
            type="button"
            onClick={onClick}
            aria-label={title}
            style={
              {
                '--gradient-from': gradientFrom,
                '--gradient-to': gradientTo,
              } as React.CSSProperties
            }
            className={`relative h-[42px] rounded-full flex items-center justify-center transition-all duration-500 group cursor-pointer focus:outline-none ${
              active
                ? 'w-[124px] shadow-none'
                : 'w-[42px] bg-[#F7F6F2] border border-stone-200/80 shadow-xs hover:w-[124px] hover:shadow-none hover:border-transparent'
            }`}
          >
            {/* Gradient background on hover or active */}
            <span
              className={`absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500 ${
                active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />

            {/* Blur glow */}
            <span
              className={`absolute top-[6px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] -z-10 transition-all duration-500 ${
                active ? 'opacity-45' : 'opacity-0 group-hover:opacity-50'
              }`}
            />

            {/* Icon */}
            <span
              className={`relative z-10 transition-all duration-500 ${
                active ? 'scale-0' : 'group-hover:scale-0 delay-0'
              }`}
            >
              <span className="text-lg text-stone-600 flex items-center justify-center">
                {icon}
              </span>
            </span>

            {/* Title */}
            <span
              className={`absolute z-10 text-white font-bold uppercase tracking-wider text-xs transition-all duration-500 ${
                active
                  ? 'scale-100 delay-75'
                  : 'scale-0 group-hover:scale-100 delay-150'
              }`}
            >
              {title}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
