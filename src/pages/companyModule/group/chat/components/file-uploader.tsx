import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from "@/lib/axios";

export function FileUploader({
  open,
  onOpenChange,
  onUploadComplete,
  entityId
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  // Prevent browser from opening file when dropped outside
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragover", preventDefaults);
    window.addEventListener("drop", preventDefaults);

    return () => {
      window.removeEventListener("dragover", preventDefaults);
      window.removeEventListener("drop", preventDefaults);
    };
  }, []);

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE) {
      alert("File size exceeds the 2MB limit.");
      return;
    }

    setSelectedFile(file);

    // Create preview only for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('entityId', entityId);
      formData.append('file_type', 'groupDoc');
      formData.append('file', selectedFile);

      const response = await axiosInstance.post(
        '/documents',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.status === 200) {
        onUploadComplete(response.data);
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      console.error(error);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setPreview(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Drop Zone */}
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors min-h-[200px]",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            {preview ? (
              <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreview(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : selectedFile ? (
              <div className="text-sm font-medium text-center">
                {selectedFile.name}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop a document here, or click to select
                </div>
                <div className="text-xs text-muted-foreground">
                  (max. 2MB)
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="text-red-600 text-sm">{uploadError}</p>
          )}

          {selectedFile && !uploading && (
            <Button className="w-full" onClick={uploadFile}>
              Upload Document
            </Button>
          )}

          {uploading && (
            <div className="text-center text-sm font-medium">
              Uploading... {uploadProgress}%
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
