
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area";

const GenerationHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedHistory = localStorage.getItem('generationHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleThumbnailClick = (imageUrl: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('image', imageUrl);
    newParams.set('prompt', localStorage.getItem(`prompt_${imageUrl}`) || '');
    router.push(`/?${newParams.toString()}`);
  };

  const clearHistory = () => {
    localStorage.removeItem('generationHistory');
    setHistory([]);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Generation History</h2>
        <Button onClick={clearHistory} variant="outline" size="sm">Clear History</Button>
      </div>
      {history.length > 0 ? (
        <ScrollArea className="h-[300px] w-full rounded-md border">
            <Grid numColumns={5} className="gap-4 p-4">
              {history.map((imageUrl, index) => (
                <Card key={index} className="cursor-pointer" onClick={() => handleThumbnailClick(imageUrl)}>
                  <CardContent className="p-2">
                    <img src={imageUrl} alt={`Generated ${index}`} className="w-full h-auto rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </ScrollArea>
      ) : (
        <p className="text-center">No generation history yet.</p>
      )}
    </div>
  );
};

export default GenerationHistory;
