"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useGenerationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GenerationHistory() {
  const { history, setOriginalImage, setGeneratedImage, clearHistory } = useGenerationStore();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  // Implement intersection observer for lazy loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...prev, entry.target.id]);
          }
        });
      },
      { rootMargin: '100px' }
    );

    const thumbnails = document.querySelectorAll('.history-thumbnail');
    thumbnails.forEach(thumbnail => observer.observe(thumbnail));

    return () => {
      thumbnails.forEach(thumbnail => observer.unobserve(thumbnail));
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-2">No generation history yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Upload a clothing item and customize your model to generate images. Your history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Previous Generations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
        >
          Clear History
        </Button>
      </div>

      <ScrollArea className="h-[220px] w-full rounded-md border">
        <div className="flex gap-4 p-4 overflow-x-auto">
          {history.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="history-thumbnail flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                setOriginalImage(item.originalImage);
                setGeneratedImage(item.generatedImage);
              }}
            >
              <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                {visibleItems.includes(item.id) ? (
                  <Image
                    src={item.generatedImage}
                    alt="Generated outfit"
                    fill
                    sizes="160px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-center">
                <p className="text-xs font-medium truncate">
                  Generation {history.length - history.indexOf(item)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
