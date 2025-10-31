
import React, { useRef } from 'react';

interface AvatarInputProps {
  headshot: string | null;
  setHeadshot: (base64: string | null) => void;
  disabled: boolean;
  setError: (error: string | null) => void;
}

export const AvatarInput: React.FC<AvatarInputProps> = ({ headshot, setHeadshot, disabled, setError }) => {
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
      reader.onload = (e) => {
        setHeadshot(e.target?.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      }
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };
  
  const handleRemoveImage = () => {
    setHeadshot(null);
     if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
        {!headshot ? (
             <label htmlFor="avatar-upload" className={`cursor-pointer text-sm font-semibold py-2 px-4 rounded-md transition-colors duration-300 ${disabled ? 'bg-gray-600 text-gray-400' : 'bg-red-800 hover:bg-red-700 text-white'}`}>
                Upload Headshot
            </label>
        ) : (
            <button onClick={handleRemoveImage} disabled={disabled} className="cursor-pointer text-sm font-semibold py-2 px-4 rounded-md transition-colors duration-300 bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800">
                Remove Image
            </button>
        )}
      </div>
       <p className="text-xs text-gray-500 mb-3 -mt-2">For best results, use a front-facing headshot with a clear background.</p>
       <div className="flex-grow w-full bg-[#1A1A1A] rounded-md border border-gray-600 flex items-center justify-center p-2 min-h-[150px]">
        {headshot ? (
            <img src={headshot} alt="Headshot preview" className="max-h-full max-w-full object-contain rounded-md" />
        ): (
            <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm">Image preview will appear here</p>
            </div>
        )}
       </div>
    </div>
  );
};
