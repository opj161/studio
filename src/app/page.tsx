"use client";

import ClothingUpload from '@/components/ClothingUpload';
import ImageDisplay from '@/components/ImageDisplay';
import ModelCustomization from '@/components/ModelCustomization';
import GenerationHistory from '@/components/GenerationHistory';
import ImageDisplayCard from '@/components/ImageDisplayCard';
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useGenerationStore } from "@/lib/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"; // Import resizable panels
import { cn } from "@/lib/utils"; // Import cn utility

export default function Home() {
  const { originalImage } = useGenerationStore(); // Get originalImage to control customization visibility

  return (
    // Container setup for full dynamic height and overflow control
    <div className="container mx-auto px-4 py-6 max-w-7xl flex flex-col h-dvh overflow-hidden">
      <Toaster />
      <header className="mb-4 text-center flex-shrink-0">
        <h1 className="text-3xl font-bold">StyleAI</h1>
      </header>

      {/* Main content area: Flex column for mobile, Flex row for large screens */}
      <main className="min-h-0 flex-1 flex flex-col lg:flex-row">

        {/* Mobile Layout: Stacked Image Display (Only visible below lg) */}
        <div className="lg:hidden mb-4"> {/* Added margin-bottom for mobile spacing */}
          <ImageDisplay />
        </div>

        {/* Desktop Layout: Resizable Panels (Only visible lg and up) */}
        <div className="hidden lg:flex flex-1 h-full"> {/* Use flex-1 to take available space */}
          <PanelGroup direction="horizontal" className="flex-1 h-full">

            {/* Panel 1: Controls */}
            <Panel defaultSize={25} minSize={20} className="flex flex-col h-full overflow-hidden">
              {/* Added overflow-hidden here, child div handles scroll */}
              <div className="flex flex-col h-full space-y-4 p-1 overflow-y-auto"> {/* Added padding and scroll */}
                {/* Upload Section */}
                <Card className="flex flex-col flex-shrink-0"> {/* Added flex-shrink-0 */}
                  <CardContent className="p-4 flex-grow">
                    <ClothingUpload />
                  </CardContent>
                </Card>

                {/* Customization Section - Conditionally Rendered with Transition */}
                {/* Wrap Card in a div for transition control */}
                <div
                  className={cn(
                    "transition-opacity duration-500 ease-in-out", // Transition classes
                    originalImage ? "opacity-100" : "opacity-0" // Conditional opacity
                  )}
                >
                  {originalImage && ( // Still need conditional rendering for layout shift
                    <Card className="flex flex-col flex-shrink-0"> {/* Added flex-shrink-0 */}
                      <CardContent className="p-4 flex-grow">
                        <ModelCustomization />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Generation History - Positioned at bottom */}
                <div className="mt-auto pt-6 min-h-0 flex-shrink-0"> {/* Added flex-shrink-0 */}
                   <GenerationHistory />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-[6px] bg-border hover:bg-primary cursor-col-resize transition-colors duration-200" />

            {/* Panel 2: Original Image */}
            <Panel defaultSize={37.5} minSize={25} className="flex flex-col h-full overflow-hidden p-4"> {/* Added padding */}
               <ImageDisplayCard type="original" />
            </Panel>

            <PanelResizeHandle className="w-[6px] bg-border hover:bg-primary cursor-col-resize transition-colors duration-200" />

            {/* Panel 3: Generated Image */}
             <Panel defaultSize={37.5} minSize={25} className="flex flex-col h-full overflow-hidden p-1"> {/* Added padding */}
               <ImageDisplayCard type="generated" />
             </Panel>

          </PanelGroup>
        </div>

      </main>

      {/* Optional Footer can go here */}
      {/* <footer className="mt-auto py-4 text-center text-muted-foreground">...</footer> */}
    </div>
  );
}
