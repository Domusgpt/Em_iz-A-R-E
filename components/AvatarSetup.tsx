import React, { useRef } from 'react';

interface AvatarSetupProps {
  croppedHeadshot: string | null;
  onImageSelected: (base64: string) => void;
  onCameraSelected: () => void;
  onRemoveImage: () => void;
  disabled: boolean;
  setError: (error: string | null) => void;
}

export const AvatarSetup: React.FC<AvatarSetupProps> = ({ croppedHeadshot, onImageSelected, onCameraSelected, onRemoveImage, disabled, setError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("File is too large. Please upload an image smaller than 4MB.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => onImageSelected(e.target?.result as string);
      reader.onerror = () => setError("Failed to read the image file.");
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg h-full flex flex-col border border-gray-700">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
        <h2 className="text-xl font-bold text-[#F5F5DC]">Your Avatar (Optional)</h2>
        <input 
            id="avatar-upload" 
            type="file" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={disabled} 
            ref={fileInputRef}
        />
        {croppedHeadshot && (
            <button onClick={onRemoveImage} disabled={disabled} className="cursor-pointer text-sm font-semibold py-2 px-4 rounded-md transition-colors duration-300 bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800">
                Change Image
            </button>
        )}
      </div>
       <p className="text-xs text-gray-500 mb-3 -mt-2">Give your emissary a face. Or don't. The void is also a valid choice.</p>
       <div className="flex-grow w-full bg-[#1A1A1A] rounded-md border border-gray-600 flex items-center justify-center p-2 min-h-[150px]">
        {croppedHeadshot ? (
            <img src={croppedHeadshot} alt="Cropped headshot preview" className="max-h-full max-w-full object-contain rounded-full" />
        ): (
            <div className="flex gap-4">
                <button onClick={onCameraSelected} disabled={disabled} className="flex flex-col items-center gap-2 p-4 bg-red-800/50 hover:bg-red-800/80 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>Use Camera</span>
                </button>
                 <label htmlFor="avatar-upload" className={`flex flex-col items-center text-white gap-2 p-4 rounded-lg transition-colors duration-300 ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-red-800/50 hover:bg-red-800/80 cursor-pointer'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>Upload Image</span>
                </label>
            </div>
        )}
       </div>
    </div>
  );
};