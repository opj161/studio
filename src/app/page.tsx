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
  const { generatedImage, setGeneratedImage, setOriginalImage } = useGenerationStore();

  // Load all settings and images from localStorage on initial load
  useEffect(() => {
    const generatedImageUrl = localStorage.getItem('generatedImageUrl');
    const originalImageUrl = localStorage.getItem('clothingItemUrl');

    // Load images if available
    if (generatedImageUrl) {
      setGeneratedImage(generatedImageUrl);
    }

    if (originalImageUrl) {
      setOriginalImage(originalImageUrl);
    }

    // Set active tab based on state
    if (generatedImageUrl && !originalImageUrl) {
      setActiveTab('customize');
    }
  }, [setGeneratedImage, setOriginalImage]);
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
