
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid } from "@/components/ui/grid";

const ImageDisplay = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const image = searchParams.get('image');
    const prompt = searchParams.get('prompt');

    console.log("Image URL from params:", image);
    console.log("Prompt from params:", prompt);

    if (image && prompt) {
      setGeneratedImage(image);
      setPrompt(prompt);
      setLoading(false);
      setError(null);
    } else if (searchParams.has('image') || searchParams.has('prompt')) {
      setGeneratedImage(null);
      setPrompt(null);
      setLoading(false);
      setError("Failed to load image and prompt.");
    } else {
      setLoading(false);
      setError(null);
    }
  }, [searchParams]);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">Generated Image</h2>
      {loading ? (
        <Grid numColumns={2} className="gap-6">
           <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>The loading indicator</CardDescription>
            </CardHeader>
             <CardContent>
              <Skeleton className="w-full aspect-square" />
             </CardContent>
           </Card>
           <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
              <CardDescription>The loading indicator</CardDescription>
            </CardHeader>
             <CardContent>
              <Skeleton className="w-full h-20" />
             </CardContent>
           </Card>
        </Grid>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : generatedImage && prompt ? (
        <Grid numColumns={2} className="gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{prompt}</p>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        <p className="text-center">No image generated yet. Customize your model and upload a clothing item to generate an image.</p>
      )}
    </div>
  );
};

export default ImageDisplay;
