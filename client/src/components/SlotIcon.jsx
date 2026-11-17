import React from 'react';
import { Sunrise, Coffee, Sun, Moon } from 'lucide-react';

export default function SlotIcon({ slotCode, className = 'h-5 w-5' }) {
  switch (slotCode) {
    case 'MORNING_FASTING':
    case 'Morning (fasting)':
      return <Sunrise className={className} />;
    case 'AFTER_BREAKFAST':
    case 'After breakfast':
      return <Coffee className={className} />;
    case 'AFTER_LUNCH':
    case 'After lunch':
      return <Sun className={className} />;
    case 'AFTER_DINNER':
    case 'After dinner':
      return <Moon className={className} />;
    default:
      return <Sunrise className={className} />;
  }
}
