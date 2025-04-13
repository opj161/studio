"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"; // Keep Button if needed for manual select fallback
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { useDropzone } from 'react-dropzone';
import { FileImage, Upload, CheckCircle, AlertCircle } from 'lucide-react'; // Import icons
import { useGenerationStore } from '@/lib/store';
import { cn } from "@/lib/utils"; // Import cn for conditional classes

const ClothingUpload = () => {
  // Removed local image state
  const { setOriginalImage } = useGenerationStore();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError(null);

    const reader = new FileReader();

    // Simulate progress (replace with actual progress if using a real upload API)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) { // Stop simulation before onload completes it
        setUploadProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 100); // Adjust interval timing as needed

    reader.onloadend = () => {
      clearInterval(interval); // Ensure interval is cleared
      const imageUrl = reader.result as string;
      setOriginalImage(imageUrl); // Set image in store
      setUploadProgress(100);
      setUploadStatus('success');
      // Optionally reset status after a delay
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000); // Reset after 3 seconds
    };

    reader.onerror = () => {
      clearInterval(interval); // Ensure interval is cleared
      console.error("File reading failed");
      setUploadError("Failed to read the file. Please try again.");
      setUploadStatus('error');
      setUploadProgress(0);
      // Optionally reset status after a delay
       setTimeout(() => {
        setUploadStatus('idle');
        setUploadError(null);
      }, 5000); // Reset after 5 seconds
    };

    reader.readAsDataURL(file);
  }, [setOriginalImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false, // Ensure only one file is accepted
    onDragEnter: () => {}, // Can add visual feedback hooks here
    onDragLeave: () => {},
  });

  // Removed displayImage logic

  return (
    <div className="space-y-4"> {/* Added space-y */}
      <h2 className="text-lg font-semibold">Upload Clothing Item</h2>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full min-h-[12rem] p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors", // Adjusted padding and min-height
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/50 hover:border-primary/70",
          uploadStatus === 'error' ? "border-destructive bg-destructive/10" : "",
          uploadStatus === 'success' ? "border-green-500 bg-green-500/10" : ""
        )}
      >
        <input {...getInputProps()} />
        {uploadStatus === 'idle' && (
          <div className="text-center text-muted-foreground">
            <Upload className="mx-auto h-10 w-10 mb-3 text-gray-400" />
            {isDragActive ? (
              <p className="font-semibold">Drop the image here...</p>
            ) : (
              <>
                <p className="font-semibold">Drag & drop or click to upload</p>
                <p className="text-xs mt-1">PNG, JPG, GIF, WEBP</p>
              </>
            )}
          </div>
        )}
        {uploadStatus === 'uploading' && (
          <div className="w-full max-w-xs text-center">
            <Progress value={uploadProgress} className="mb-2 h-2" />
            <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
          </div>
        )}
        {uploadStatus === 'success' && (
          <div className="text-center text-green-600">
            <CheckCircle className="mx-auto h-10 w-10 mb-3" />
            <p className="font-semibold">Upload Complete!</p>
          </div>
        )}
        {uploadStatus === 'error' && (
           <div className="w-full text-center text-destructive">
             <AlertCircle className="mx-auto h-10 w-10 mb-3" />
             <p className="font-semibold">Upload Failed</p>
             <p className="text-sm mt-1">{uploadError || "An unknown error occurred."}</p>
           </div>
        )}
      </div>
      {/* Removed the preview image section */}
      {/* Removed the "No image uploaded yet" text section */}
    </div>
  );
};

export default ClothingUpload;
