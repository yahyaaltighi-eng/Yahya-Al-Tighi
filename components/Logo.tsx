import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-12" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <img 
        src="/logo.png" 
        alt="شعار وزارة التربية والتعليم - مراقبة سلوق" 
        className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 filter"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback styling if image is missing
          target.style.display = 'none';
          target.parentElement?.classList.add('bg-gray-100', 'border-2', 'border-dashed', 'border-gray-300', 'rounded-full');
          target.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-[10px] text-center text-gray-400 font-bold p-1">logo.png<br/>غير موجود</span>');
        }}
      />
    </div>
  );
};

export default Logo;