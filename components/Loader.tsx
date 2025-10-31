
import React from 'react';

interface LoaderProps {
  text: string;
}

export const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-4">
      <div className="w-16 h-16 border-4 border-red-700 border-dashed rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-gray-300">{text}</p>
    </div>
  );
};
