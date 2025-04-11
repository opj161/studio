"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, Share } from 'lucide-react'; // Removed Undo
import { useGenerationStore } from '@/lib/store';
// Remove Progress import
// import { Progress } from "@/components/ui/progress";

export default function ImageDisplay() {
  // Remove generationProgress from store destructuring
  const { originalImage, generatedImage, isLoading, error } = useGenerationStore();
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [generatedLoaded, setGeneratedLoaded] = useState(false);

  const handleDownload = async () => { // Add async keyword
    if (!generatedImage) return;

    try {
      // Fetch the image data from the relative URL
      const response = await fetch(generatedImage);
      if (!response.ok) throw new Error('Failed to fetch image for download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = `styleai-generated-${Date.now()}.png`; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up blob URL
    } catch (error) {
      console.error("Download failed:", error);
      // Optionally show a toast message to the user
    }
  };

  const handleShare = async () => { // Already async, but ensure it is
    if (!generatedImage || !navigator.share) return;

    try {
      // Fetch the image data from the relative URL to create a Blob/File
      const response = await fetch(generatedImage);
      if (!response.ok) throw new Error('Failed to fetch image for sharing');
      const blob = await response.blob();
      const file = new File([blob], 'styleai-generated.png', { type: blob.type || 'image/png' });

      await navigator.share({
        title: 'My StyleAI Generated Image',
        text: 'Check out this outfit I generated with StyleAI!',
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Results</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card className="h-full">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Original Item</h3>
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
              {originalImage ? (
                <>
                  {!originalLoaded && <Skeleton className="absolute inset-0" />}
                  <Image
                    src={originalImage}
                    alt="Original clothing item"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                    priority={true}
                    onLoad={() => setOriginalLoaded(true)}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image uploaded
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Image */}
        <Card className="h-full flex flex-col">
          <CardContent className="p-4 flex-grow">
            <h3 className="text-lg font-medium mb-2">Generated Result</h3>
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  {/* Simple Spinner */}
                  <div className="h-12 w-12 mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  {/* Remove Progress bar */}
                  {/* <Progress value={generationProgress || 0} className="w-full mb-2" /> */}
                  <p className="text-sm text-center font-medium">
                    Generating your image...
                    {/* Remove percentage display */}
                  </p>
                  {/* Remove detailed progress text */}
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-destructive text-center">
                  <p className="text-center">
                    Error: {error.message || 'Something went wrong'}
                  </p>
                </div>
              ) : generatedImage ? (
                <>
                  {!generatedLoaded && <Skeleton className="absolute inset-0" />}
                  <Image
                    src={generatedImage}
                    alt="Generated model wearing item"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                    quality={90}
                    onLoad={() => setGeneratedLoaded(true)}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p className="text-center max-w-xs">
                    Upload a clothing item and customize your model to generate an image
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          {generatedImage && !isLoading && (
            <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              {navigator.share && (
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" /> Share
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
