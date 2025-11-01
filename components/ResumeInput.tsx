import React from 'react';

interface ResumeInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({ resumeText, setResumeText, handleFileChange, disabled }) => {
  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg h-full flex flex-col border border-gray-700">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
        <h2 className="text-xl font-bold text-[#F5F5DC]">Source Material</h2>
        <label htmlFor="resume-upload" className={`cursor-pointer text-sm font-semibold py-2 px-4 rounded-md transition-colors duration-300 ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-red-800 hover:bg-red-700 text-white'}`}>
          Upload .txt
        </label>
        <input id="resume-upload" type="file" accept=".txt" onChange={handleFileChange} className="hidden" disabled={disabled} />
      </div>
      <p className="text-xs text-gray-500 mb-3 -mt-2">Let's transmute your professional history into a compelling narrative.</p>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="The raw, unfiltered text of your career. We'll find the poetry in the bullet points..."
        disabled={disabled}
        className="flex-grow w-full bg-[#1A1A1A] text-gray-300 p-4 rounded-md border border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none disabled:bg-gray-800 disabled:cursor-not-allowed"
      />
    </div>
  );
};