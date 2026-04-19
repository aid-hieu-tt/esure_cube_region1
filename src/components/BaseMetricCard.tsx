import React from 'react';
import { cn } from '../lib/utils';

interface BaseMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  logo?: string;
  onClick?: () => void;
}

export const BaseMetricCard: React.FC<BaseMetricCardProps> = ({
  title,
  value,
  subtitle,
  bgColor = 'bg-white',
  textColor = 'text-gray-900',
  logo,
  onClick,
}) => {
  // Split title if it contains newlines to create heading hierarchy
  const lines = title.split('\n');
  const heading1 = lines[0] || '';
  const heading2 = lines.slice(1).join(' ') || subtitle;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden border border-gray-200/80 rounded-xl p-3.5 flex flex-col items-center justify-center text-center h-full w-full',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-gray-300 shadow-sm',
        onClick && 'cursor-pointer active:scale-95',
        bgColor
      )}
    >
      <h3 className="text-[13px] md:text-sm font-bold text-gray-800 tracking-tight">
        {heading1}
      </h3>
      
      {heading2 && (
        <h4 className="text-[10px] md:text-[11px] font-semibold text-gray-500 mt-0.5">
          {heading2}
        </h4>
      )}
      
      <div className="mt-2.5 flex flex-col items-center justify-end flex-grow">
        <p className={cn('text-2xl lg:text-[26px] font-extrabold tracking-tight', textColor)}>
          {value}
        </p>
      </div>
    </div>
  );
};
