
"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropzone } from 'react-dropzone';
import { FileImage, Upload } from 'lucide-react';

const ClothingUpload = () => {
  const [image, setImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: 'image/*'});

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload Clothing Item</h2>
      <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-48 border-2 border-primary border-dashed rounded-md bg-secondary text-foreground cursor-pointer">
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <div className="text-center">
              <FileImage className="mx-auto h-6 w-6 mb-2" />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
        }
      </div>
      {image && (
        <div className="mt-4">
          <img src={image} alt="Uploaded Clothing" className="max-w-full h-auto rounded-md" />
        </div>
      )}
      {!image && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">No image uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default ClothingUpload;
