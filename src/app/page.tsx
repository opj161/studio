"use client";

import ClothingUpload from '@/components/ClothingUpload';
import ImageDisplay from '@/components/ImageDisplay';
import ModelCustomization from '@/components/ModelCustomization';
import GenerationHistory from '@/components/GenerationHistory';
import ImageDisplayCard from '@/components/ImageDisplayCard';
// Removed Tabs imports
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useGenerationStore } from "@/lib/store";
// Removed useState, useEffect

export default function Home() {
  // Removed activeTab state
  const { originalImage } = useGenerationStore(); // Get originalImage to control customization visibility

  // Removed effect related to tabs

  return (
    // Added min-h-screen and flex column structure for potential footer later
    <div className="container mx-auto px-4 py-6 max-w-7xl flex flex-col min-h-screen">
      <Toaster />
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-bold">StyleAI</h1>
      </header>

      {/* Main content grid */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-[minmax(350px,_1fr)_2fr] xl:grid-cols-[minmax(350px,_1fr)_1.5fr_1.5fr] gap-4">

        {/* Left Column: Controls */}
        <div className="lg:col-span-1 flex flex-col h-full space-y-4">
          {/* Upload Section */}
          <Card className="flex flex-col">
            {/* Consider adding CardHeader if needed */}
            <CardContent className="p-4 flex-grow">
              <ClothingUpload />
            </CardContent>
          </Card>

          {/* Customization Section - Conditionally Rendered */}
          {/* TODO: Add smooth transition (e.g., fade-in) */}
          {originalImage && (
            <Card className="flex flex-col">
              {/* Consider adding CardHeader if needed */}
              <CardContent className="p-4 flex-grow">
                <ModelCustomization />
              </CardContent>
            </Card>
          )}

          {/* Generation History - Unified */}
          {/* TODO: Implement collapsible logic (e.g., Accordion/Details) */}
          {/* TODO: Refine styling for history items (thumbnails) */}
          {/* Generation History - Positioned at bottom */}
          <div className="mt-auto pt-6 min-h-0">
             <GenerationHistory />
          </div>          {/* Generation History - Positioned at bottom */}








































        </div>

        {/* Right Column: Results */}
        <div className="lg:hidden col-span-1">
          <ImageDisplay />
        </div>

        {/* --- Columns 2 & 3: Results (Vary based on breakpoint) --- */}

        {/* Original Image Card Container (LG: Column 2, XL: Column 2) */}
        <div className="hidden lg:flex lg:col-start-2 lg:col-span-1 xl:col-start-2 xl:col-span-1 flex-col h-full">
           <ImageDisplayCard type="original" />
        </div>

        {/* Generated Result Card Container (LG: Column 2 (overlaps), XL: Column 3) */}
         <div className="hidden lg:flex lg:col-start-2 lg:col-span-1 xl:col-start-3 xl:col-span-1 flex-col h-full">
           <ImageDisplayCard type="generated" />
         </div>

        {/* Removed separate mobile history section */}
      </main>

      {/* Optional Footer can go here */}
      {/* <footer className="mt-auto py-4 text-center text-muted-foreground">...</footer> */}
    </div>
  );
}
