"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Share, UploadCloud, Wand2, AlertCircle } from 'lucide-react';
import { useGenerationStore } from '@/lib/store';

export default function ImageDisplay() {
  const { originalImage, generatedImage, isLoading, error } = useGenerationStore();
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [generatedLoaded, setGeneratedLoaded] = useState(false);

  // Reset loaded states if images change using useEffect
  useEffect(() => {
    setOriginalLoaded(false);
  }, [originalImage]);

  useEffect(() => {
    setGeneratedLoaded(false);
  }, [generatedImage]);


  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      if (!response.ok) throw new Error('Failed to fetch image for download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `styleai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // TODO: Add toast notification on failure
    }
  };

  const handleShare = async () => {
    // Check if generatedImage exists and navigator.share is supported
    if (!generatedImage || typeof navigator.share !== 'function') return;
    try {
      const response = await fetch(generatedImage);
      if (!response.ok) throw new Error('Failed to fetch image for sharing');
      const blob = await response.blob();
      const file = new File([blob], 'styleai-generated.png', { type: blob.type || 'image/png' });
      await navigator.share({
        title: 'My StyleAI Generated Image',
        text: 'Check out this outfit I generated with StyleAI!',
        files: [file]
      });
    } catch (err) {
      console.error('Error sharing:', err);
      // TODO: Add toast notification on failure
    }
  };

  // Helper component for placeholder content
  const PlaceholderContent = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-4">
      <Icon className="h-16 w-16 mb-4 text-gray-400" />
      <p className="text-center text-sm">{text}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Original Image Card */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Original Item</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            {originalImage ? (
              <>
                {!originalLoaded && <Skeleton className="absolute inset-0" />}
                <Image
                  src={originalImage}
                  alt="Original clothing item"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-contain transition-opacity duration-300 ${originalLoaded ? 'opacity-100' : 'opacity-0'}`}
                  priority={true}
                  onLoad={() => setOriginalLoaded(true)}
                />
              </>
            ) : (
              <PlaceholderContent icon={UploadCloud} text="Upload a clothing item to get started" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Image Card */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Result</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Skeleton className="h-full w-full" />
                <p className="absolute bottom-4 text-sm text-center font-medium text-muted-foreground">
                  AI is creating your image...
                </p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Failed</AlertTitle>
                  <AlertDescription>
                    {error.message || 'An unexpected error occurred. Please try again.'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : generatedImage ? (
              <>
                {!generatedLoaded && <Skeleton className="absolute inset-0" />}
                <Image
                  src={generatedImage}
                  alt="Generated model wearing item"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-contain transition-opacity duration-300 ${generatedLoaded ? 'opacity-100' : 'opacity-0'}`}
                  quality={90}
                  onLoad={() => setGeneratedLoaded(true)}
                />
              </>
            ) : (
              <PlaceholderContent icon={Wand2} text="Customize settings and click Generate" />
            )}
          </div>
        </CardContent>

        {generatedImage && !isLoading && !error && (
          <CardFooter className="px-4 pb-4 pt-2 flex justify-end gap-2">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Explicitly check if navigator and navigator.share function exist */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share className="h-4 w-4" />
                      <span className="sr-only">Share Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
