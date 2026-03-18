import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

interface PhotoUploaderProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  compact?: boolean;
}

export function PhotoUploader({ currentPhoto, onPhotoChange, compact = false }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  // Determine if the current photo is an external URL (not base64/data URI)
  const isExternalUrl = !!currentPhoto &&
    !currentPhoto.startsWith('data:') &&
    (currentPhoto.startsWith('http://') || currentPhoto.startsWith('https://'));

  const hasPhoto = !!currentPhoto && !currentPhoto.includes('No Photo') && !currentPhoto.includes('svg+xml');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 5MB.');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onPhotoChange(result);
      setIsProcessing(false);
      setJustUploaded(true);
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
      <div className="flex items-center gap-2">
        {/* Thumbnail preview */}
        {hasPhoto && (
          <div className="relative w-10 h-12 flex-shrink-0">
            <img
              src={currentPhoto}
              alt="Preview"
              className="w-full h-full object-cover rounded border border-purple-300"
            />
            {isExternalUrl && (
              <div
                className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center"
                title="URL photo — may not print correctly. Upload a local file for best results."
              >
                <AlertTriangle className="w-2.5 h-2.5 text-yellow-900" />
              </div>
            )}
          </div>
        )}
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
              Updated!
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-1" />
              {hasPhoto ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Photo preview */}
        <div className="flex-shrink-0">
          {hasPhoto ? (
            <div className="relative">
              <img
                src={currentPhoto}
                alt="Preview"
                className="w-20 h-24 object-cover rounded border-2 border-purple-300"
              />
              {isExternalUrl && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center"
                  title="URL photo">
                  <AlertTriangle className="w-3 h-3 text-yellow-900" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-24 bg-gray-200 rounded border-2 border-dashed border-purple-300 flex items-center justify-center">
              <Camera className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-purple-900 mb-1 text-sm">Student Photo</h4>

          {isExternalUrl ? (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mb-2">
              <p className="text-xs text-yellow-800 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-600" />
                <span>
                  <strong>URL photo detected.</strong> The photo may not appear in downloads if the image server blocks access. 
                  For reliable printing, upload a local file instead.
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-purple-800 mb-2">
              {hasPhoto ? 'Click below to change the photo' : 'Upload a student photo for the ID card'}
            </p>
          )}

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
                Photo Updated!
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {hasPhoto ? 'Replace with Local File' : 'Upload Photo'}
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