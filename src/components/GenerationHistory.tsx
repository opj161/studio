"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useGenerationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, History } from 'lucide-react'; // Added History icon
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

export default function GenerationHistory() {
  const { history, setOriginalImage, setGeneratedImage, clearHistory } = useGenerationStore();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  // Intersection observer for lazy loading images
  useEffect(() => {
    if (typeof window === 'undefined' || !history.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...new Set([...prev, entry.target.id])]);
          }
        });
      },
      { rootMargin: '200px' }
    );
    const historyItems = document.querySelectorAll('.history-item-card');
    historyItems.forEach(item => observer.observe(item));
    return () => {
      historyItems.forEach(item => observer.unobserve(item));
    };
  }, [history]);

  const handleRestore = (item: typeof history[0]) => {
    setOriginalImage(item.originalImage);
    setGeneratedImage(item.generatedImage);
  };

  // Use Accordion for collapsibility
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="history-item">
      <AccordionItem value="history-item">
        <AccordionTrigger className="text-xl font-semibold px-1 flex justify-between items-center w-full">
          <div className="flex items-center"> {/* Group title and icon */}
             <History className="h-5 w-5 mr-2" /> {/* Optional: Add icon */}
             Generation History
          </div>
          {/* Clear button moved inside trigger for better alignment when collapsed */}
          {history.length > 0 && (
             <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion toggle
                  clearHistory();
                }}
                className="text-muted-foreground hover:text-destructive mr-2" // Adjusted margin
                aria-label="Clear History"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
          )}
        </AccordionTrigger>
        <AccordionContent>
          {history.length === 0 ? (
            <div className="text-center py-4 px-4 border rounded-md bg-muted/50 mt-2">
              <p className="text-sm text-muted-foreground">No history yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Generated images will appear here.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[40vh] w-full rounded-md border p-2 mt-2">
              <div className="space-y-3 pr-2">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    className="history-item-card cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleRestore(item)}
                  >
                    <CardContent className="p-2 flex items-center gap-3">
                      <div className="flex gap-1">
                        {/* Original Thumbnail */}
                        <div className="relative w-16 h-16 rounded overflow-hidden border bg-muted flex-shrink-0">
                          {visibleItems.includes(item.id) ? (
                            <Image
                              src={item.originalImage}
                              alt="Original Item Thumbnail"
                              fill
                              sizes="64px"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Skeleton className="w-full h-full" />
                          )}
                        </div>
                        {/* Generated Thumbnail */}
                        <div className="relative w-16 h-16 rounded overflow-hidden border bg-muted flex-shrink-0">
                          {visibleItems.includes(item.id) ? (
                            <Image
                              src={item.generatedImage}
                              alt="Generated Result Thumbnail"
                              fill
                              sizes="64px"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Skeleton className="w-full h-full" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right flex-grow">
                         <p>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
