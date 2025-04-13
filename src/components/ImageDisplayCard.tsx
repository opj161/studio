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
import { cn } from '@/lib/utils'; // Assuming cn utility is in utils

interface ImageDisplayCardProps {
  type: 'original' | 'generated';
}

export default function ImageDisplayCard({ type }: ImageDisplayCardProps) {
   const { originalImage, generatedImage, isLoading, error } = useGenerationStore();
   const [isLoaded, setIsLoaded] = useState(false);

   const imageSrc = type === 'original' ? originalImage : generatedImage;
   const title = type === 'original' ? 'Original Item' : 'Generated Result';
   const PlaceholderIcon = type === 'original' ? UploadCloud : Wand2;
   const placeholderText = type === 'original' ? 'Upload an item...' : 'Generate an image...';

   useEffect(() => {
     setIsLoaded(false); // Reset loading state when image source changes
   }, [imageSrc]);

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

   // Helper for placeholder
   const PlaceholderContent = ({ icon: Icon }: { icon: React.ElementType }) => (
     <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-4">
       <Icon className="h-16 w-16 mb-4 text-gray-400" />
       <p className="text-center text-sm">{placeholderText}</p>
     </div>
   );

   return (
     <Card className="flex flex-col flex-grow"> {/* Ensure card grows */}
       <CardHeader>
         <CardTitle>{title}</CardTitle>
       </CardHeader>
       <CardContent className="p-4 flex-grow"> {/* Content grows */}
         <div className="relative aspect-square w-full h-full bg-muted rounded-md overflow-hidden"> {/* Container uses full height */}
           {/* Loading State (Generated Only) */}
           {type === 'generated' && isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Skeleton className="h-full w-full" />
                <p className="absolute bottom-4 text-sm text-center font-medium text-muted-foreground">
                  AI is creating...
                </p>
              </div>
           )}

           {/* Error State (Generated Only) */}
           {type === 'generated' && error && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
               <Alert variant="destructive" className="w-full">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Failed</AlertTitle>
                 <AlertDescription>{error.message || 'An unexpected error occurred.'}</AlertDescription>
               </Alert>
             </div>
           )}

           {/* Image Display State */}
           {imageSrc && !(type === 'generated' && (isLoading || error)) && (
             <>
               {!isLoaded && <Skeleton className="absolute inset-0" />}
               <Image
                 src={imageSrc}
                 alt={title}
                 fill
                 sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw" // Adjusted sizes
                 className={cn("object-contain transition-opacity duration-300", isLoaded ? 'opacity-100' : 'opacity-0')}
                 priority={type === 'original'} // Prioritize original image loading
                 quality={type === 'generated' ? 90 : undefined} // Set quality for generated
                 onLoad={() => setIsLoaded(true)}
               />
             </>
           )}

           {/* Placeholder State */}
           {!imageSrc && !(type === 'generated' && (isLoading || error)) && (
              <PlaceholderContent icon={PlaceholderIcon} />
           )}
         </div>
       </CardContent>

       {/* Footer with buttons (Generated Only, when image exists and no loading/error) */}
       {type === 'generated' && generatedImage && !isLoading && !error && (
          <CardFooter className="px-4 pb-4 pt-2 flex justify-end gap-2">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Download</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Share Button (conditionally rendered based on browser support) */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share className="h-4 w-4" />
                      <span className="sr-only">Share Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Share</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardFooter>
        )}
     </Card>
   );
}