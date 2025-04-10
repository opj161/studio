"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ClothingUpload = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload Clothing Item</h2>
      <Input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div className="mt-4">
          <img src={image} alt="Uploaded Clothing" className="max-w-full h-auto rounded-md" />
        </div>
      )}
    </div>
  );
};

export default ClothingUpload;
