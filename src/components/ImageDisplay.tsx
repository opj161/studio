"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, Share, Undo } from 'lucide-react';
import { useGenerationStore } from '@/lib/store';
import { Progress } from "@/components/ui/progress";

export default function ImageDisplay() {
  const { originalImage, generatedImage, isLoading, error, generationProgress } = useGenerationStore();
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [generatedLoaded, setGeneratedLoaded] = useState(false);

  const handleDownload = () => {
    if (!generatedImage) return;

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `styleai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) return;

    try {
      // Convert the data URL to a blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'styleai-generated.png', { type: 'image/png' });

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
                  <div className="h-12 w-12 mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <Progress value={generationProgress || 0} className="w-full mb-2" />
                  <p className="text-sm text-center font-medium">
                    Generating your image... {generationProgress ? `${generationProgress}%` : ''}
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {generationProgress && generationProgress < 30 ? 'Analyzing clothing item...' :
                     generationProgress && generationProgress < 60 ? 'Creating virtual model...' :
                     generationProgress && generationProgress < 80 ? 'Applying style transfer...' :
                     generationProgress && generationProgress >= 80 ? 'Finalizing image...' : ''}
                  </p>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-destructive">
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
