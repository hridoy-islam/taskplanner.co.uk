// import { useState, useRef } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { ImageIcon, X } from 'lucide-react'
// import { cn } from "@/lib/utils"

// export function ImageUploader({ open, onOpenChange, onUploadComplete, studentId  }) {
//   const [dragActive, setDragActive] = useState(false)
//   const [selectedImage, setSelectedImage] = useState<string | null>(null)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [uploading, setUploading] = useState(false)
//   const inputRef = useRef<HTMLInputElement>(null)

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     const file = e.dataTransfer.files?.[0]
//     if (file && file.type.startsWith("image/")) {
//       handleFile(file)
//     }
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) handleFile(file)
//   }

//   const handleFile = (file: File) => {
//     // Preview
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       setSelectedImage(e.target?.result as string)
//     }
//     reader.readAsDataURL(file)
//   }

//   const simulateUpload = async () => {
//     setUploading(true)
//     for (let i = 0; i <= 100; i += 5) {
//       setUploadProgress(i)
//       await new Promise(resolve => setTimeout(resolve, 100))
//     }
//     onUploadComplete(selectedImage || "/placeholder.svg")
//     setUploading(false)
//     setUploadProgress(0)
//     setSelectedImage(null)
//     onOpenChange(false)
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Upload Profile Picture</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div
//             className={cn(
//               "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
//               dragActive ? "border-primary" : "border-muted-foreground/25",
//               selectedImage ? "pb-0" : "min-h-[200px]"
//             )}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//           >
//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleChange}
//               className="absolute inset-0 cursor-pointer opacity-0"
//             />

//             {selectedImage ? (
//               <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg">
//                 <img
//                   src={selectedImage}
//                   alt="Preview"
//                   className="object-cover"
//                 />
//                 <Button
//                   size="icon"
//                   variant="destructive"
//                   className="absolute right-2 top-2"
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     setSelectedImage(null)
//                     if (inputRef.current) inputRef.current.value = ''
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center gap-2 text-center">
//                 <ImageIcon className="h-8 w-8 text-muted-foreground" />
//                 <div className="text-sm font-medium">
//                   Drag & drop an image here, or click to select
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   PNG, JPG or GIF (max. 2MB)
//                 </div>
//               </div>
//             )}
//           </div>

//           {selectedImage && !uploading && (
//             <Button className="w-full" onClick={simulateUpload}>
//               Upload Image
//             </Button>
//           )}

//           {uploading && (
//             <div className="relative mx-auto h-12 w-12">
//               <svg
//                 className="h-12 w-12 -rotate-90 transform"
//                 viewBox="0 0 36 36"
//               >
//                 <circle
//                   cx="18"
//                   cy="18"
//                   r="16"
//                   fill="none"
//                   className="stroke-muted-foreground/20"
//                   strokeWidth="2"
//                 />
//                 <circle
//                   cx="18"
//                   cy="18"
//                   r="16"
//                   fill="none"
//                   className="stroke-primary"
//                   strokeWidth="2"
//                   strokeDasharray={100}
//                   strokeDashoffset={100 - uploadProgress}
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <span className="text-sm font-medium">{uploadProgress}%</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from '../../lib/axios'; // Adjust the path as necessary
import axios from 'axios';

export function ImageUploader({
  open,
  onOpenChange,
  onUploadComplete,
  taskId
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialData, setInitialData] = useState<string | null>(null);

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

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setUploading(true);

    try {
      const file = inputRef.current?.files?.[0];
      if (!file) {
        setUploading(false);
        return;
      }

      const formData = new FormData();

      // formData.append('entity_id', 'abc');
      // formData.append('file_type', 'document');
      // formData.append('files[]', file);

      // const response = await axios.post(
      //   `https://core.qualitees.co.uk/api/documents`,
      //   formData,
      //   {
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //       'x-company-token': 'taskplanner-520480935547'
      //     },
      //     onUploadProgress: (progressEvent) => {
      //       const percentCompleted = Math.round(
      //         (progressEvent.loaded * 100) / progressEvent?.total
      //       );
      //       setUploadProgress(percentCompleted);
      //     }
      //   }
      // );

      // if (response.status === 200) {
      //   onUploadComplete(response.data);
      // }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedImage(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
              dragActive ? 'border-primary' : 'border-muted-foreground/25',
              selectedImage ? 'pb-0' : 'min-h-[200px]'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {selectedImage ? (
              <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop an image here, or click to select
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG or GIF (max. 2MB)
                </div>
              </div>
            )}
          </div>

          {selectedImage && !uploading && (
            <Button className="w-full" onClick={uploadImage}>
              Upload Image
            </Button>
          )}

          {uploading && (
            <div className="relative mx-auto h-12 w-12">
              <svg
                className="h-12 w-12 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-muted-foreground/20"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="2"
                  strokeDasharray={100}
                  strokeDashoffset={100 - uploadProgress}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
