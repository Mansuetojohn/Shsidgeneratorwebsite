import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, CheckCircle } from 'lucide-react';

interface PhotoUploaderProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  compact?: boolean;
}

export function PhotoUploader({ currentPhoto, onPhotoChange, compact = false }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 5MB.');
      return;
    }

    setIsProcessing(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onPhotoChange(result);
      setIsProcessing(false);
      setJustUploaded(true);
      
      // Reset upload success indicator after 2 seconds
      setTimeout(() => setJustUploaded(false), 2000);
    };
    reader.onerror = () => {
      alert('Failed to read image file. Please try again.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  if (compact) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className={`border-purple-300 text-purple-700 hover:bg-purple-50 ${justUploaded ? 'border-green-500 bg-green-50 text-green-700' : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : justUploaded ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Photo Updated!
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-1" />
              {currentPhoto && !currentPhoto.includes('No Photo') ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
      </>
    );
  }

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {currentPhoto && !currentPhoto.includes('No Photo') && (
          <img 
            src={currentPhoto} 
            alt="Preview" 
            className="w-20 h-24 object-cover rounded border-2 border-purple-300"
          />
        )}
        <div className="flex-1">
          <h4 className="font-bold text-purple-900 mb-2 text-sm">Student Photo</h4>
          <p className="text-xs text-purple-800 mb-3">
            {currentPhoto && !currentPhoto.includes('No Photo') 
              ? 'Click below to change the photo'
              : 'Upload a student photo for the ID card'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className={`${justUploaded ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : justUploaded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Photo Updated Successfully!
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {currentPhoto && !currentPhoto.includes('No Photo') ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-600 mt-2">
            📸 Accepted: JPG, PNG (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}