import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileIcon, ImageIcon, X, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';

export function FileUploader({
  open,
  onOpenChange,
  onUploadComplete,
  entityId
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Get files from the drop event
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setFileType(file.type);
    setFileName(file.name);
    setImageError(false);

    // For images, we show a preview. For other files, we just show the icon.
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Non-image files don't get a dataURL preview, but we mark them as "selected"
      setSelectedPreview('file-selected'); 
    }
  };

  const uploadImage = async () => {
    if (!selectedPreview) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Logic: If dropped, the file might not be in inputRef. 
      // It's safer to store the File object in state, but using inputRef is fine if handled carefully.
      const file = inputRef.current?.files?.[0];
      
      if (!file) {
        throw new Error('No file selected');
      }

      const formData = new FormData();
      formData.append('entityId', entityId);
      formData.append('file_type', 'taskDoc');
      formData.append('file', file);

      const response = await axiosInstance.post('/documents', formData, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.status === 200 || response.status === 201) {
        onUploadComplete(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An error occurred while uploading. Please try again.');
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedPreview(null);
    setFileName(null);
    setUploadProgress(0);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="z-[10008] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all',
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
              selectedPreview ? 'pb-6' : 'min-h-[200px]'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            
            {selectedPreview ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative flex items-center justify-center h-32 w-32 overflow-hidden rounded-lg bg-muted">
                  {fileType?.startsWith('image/') && !imageError ? (
                    <img
                      src={selectedPreview === 'file-selected' ? '' : selectedPreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <FileIcon className="h-16 w-16 text-muted-foreground" />
                  )}
                  
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPreview(null);
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground truncate max-w-[200px]">
                  {fileName}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm font-medium text-primary">
                  Click or drag and drop
                </div>
                <div className="text-xs text-muted-foreground">
                  Images, PDF, or Docs (Max 5MB)
                </div>
              </div>
            )}
          </div>

          {uploadError && <p className="text-sm text-destructive text-center">{uploadError}</p>}

          {selectedPreview && !uploading && (
            <Button className="w-full" onClick={uploadImage}>
              Upload File
            </Button>
          )}

          {uploading && (
             <div className="space-y-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
                <p className="text-center text-xs font-medium">{uploadProgress}% Uploading...</p>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}