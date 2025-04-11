"use client";

import { useState, useEffect } from 'react';
import ClothingUpload from '@/components/ClothingUpload';
import ImageDisplay from '@/components/ImageDisplay';
import ModelCustomization from '@/components/ModelCustomization';
import GenerationHistory from '@/components/GenerationHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useGenerationStore } from "@/lib/store";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('upload');
  // Get generatedImage state to potentially influence initial tab, but don't load manually
  const { generatedImage } = useGenerationStore();

  // Remove the useEffect for manual localStorage loading.
  // Zustand's persist middleware handles hydration automatically.

  // Optional: Set initial tab based on hydrated state (might cause flicker, test needed)
  // useEffect(() => {
  //   if (generatedImage) {
  //     setActiveTab('customize'); // Or keep 'upload' as default?
  //   }
  // }, [generatedImage]); // Run only when generatedImage changes after hydration

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center">StyleAI</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar with controls - takes 4/12 columns on large screens */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tabs for mobile and desktop */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
            </TabsList>

            {activeTab === 'upload' ? (
              <Card>
                <CardContent className="p-4">
                  <ClothingUpload />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <ModelCustomization />
                </CardContent>
              </Card>
            )}
          </Tabs>

          {/* Generation History - Always visible on desktop, collapsible on mobile */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold mb-4">Generation History</h2>
            <GenerationHistory />
          </div>
        </div>

        {/* Main content area - takes 8/12 columns on large screens */}
        <div className="lg:col-span-8">
          <ImageDisplay />
        </div>

        {/* Collapsible history section for mobile only */}
        <div className="block lg:hidden col-span-1">
          <details className="mt-4 open:pb-4">
            <summary className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors">
              Generation History
            </summary>
            <GenerationHistory />
          </details>
        </div>
      </div>
    </div>
  );
}
