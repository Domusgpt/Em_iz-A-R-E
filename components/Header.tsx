
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#1A1A1A] shadow-md border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center">
           <svg width="32" height="32" viewBox="0 0 100 100" className="mr-3 text-[#E53935]">
            <path d="M50 90 V60 M50 60 L30 40 M50 60 L70 40 M30 40 L20 30 M30 40 L40 30 M70 40 L60 30 M70 40 L80 30" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M50 60 L50 30 M50 30 L40 20 M50 30 L60 20" stroke="#F5F5DC" strokeWidth="5" fill="none" strokeLinecap="round"/>
          </svg>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5DC] to-[#D4B996]">
            M'iz A-R-E
          </h1>
        </div>
      </div>
    </header>
  );
};
