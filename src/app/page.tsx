"use client";

import ClothingUpload from '../components/ClothingUpload';
import ImageDisplay from '../components/ImageDisplay';
import ModelCustomization from '../components/ModelCustomization';
import GenerationHistory from '../components/GenerationHistory';
import ImageDisplayCard from '../components/ImageDisplayCard';
import { Card, CardContent } from "../components/ui/card";
import { Toaster } from "../components/ui/toaster";
import { useGenerationStore } from "../lib/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "../lib/utils";

export default function Home() {
  const { originalImage } = useGenerationStore();

  return (
    // Removed container, mx-auto, px-4, py-6, max-w-7xl, h-dvh, overflow-hidden
    // Added h-full to fill the flex-1 space from layout.tsx
    <div className="flex flex-col h-full">
      <Toaster />
      {/* Removed header as it's now in layout.tsx */}

      {/* Main content area: Use flex-1 to grow */}
      {/* Removed lg:flex-row, handled by PanelGroup below */}
      <main className="min-h-0 flex-1 flex flex-col">

        {/* Mobile Layout: Stacked Image Display (Only visible below lg) */}
        <div className="lg:hidden p-4 space-y-4"> {/* Added padding and spacing for mobile */}
          {/* Upload Section */}
          <Card className="flex flex-col flex-shrink-0">
            <CardContent className="p-4 flex-grow">
              <ClothingUpload />
            </CardContent>
          </Card>
          {/* Customization Section */}
           <div
             className={cn(
               "transition-opacity duration-500 ease-in-out",
               originalImage ? "opacity-100" : "opacity-0 pointer-events-none" // Hide and disable interaction when hidden
             )}
           >
             {originalImage && (
               <Card className="flex flex-col flex-shrink-0">
                 <CardContent className="p-4 flex-grow">
                   <ModelCustomization />
                 </CardContent>
               </Card>
             )}
           </div>
          {/* Image Display */}
          <ImageDisplay />
          {/* History */}
          <div className="pt-4"> {/* Add padding top */}
             <GenerationHistory />
          </div>
        </div>

        {/* Desktop Layout: Resizable Panels (Only visible lg and up) */}
        {/* Added flex-1 and h-full to ensure it fills the main area */}
        <div className="hidden lg:flex flex-1 h-full p-4"> {/* Added padding around the whole panel group */}
          <PanelGroup direction="horizontal" className="flex-1 h-full gap-4"> {/* Added gap */}

            {/* Panel 1: Controls */}
            {/* Removed internal padding p-1, added overflow-hidden */}
            <Panel defaultSize={25} minSize={20} className="flex flex-col h-full overflow-hidden rounded-lg border bg-card">
              {/* Inner div for scrolling */}
              <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto"> {/* Added padding here */}
                {/* Upload Section */}
                <Card className="flex flex-col flex-shrink-0 shadow-none border-none"> {/* Removed card styles */}
                  <CardContent className="p-0 flex-grow"> {/* Removed padding */}
                    <ClothingUpload />
                  </CardContent>
                </Card>

                {/* Customization Section */}
                <div
                  className={cn(
                    "transition-opacity duration-500 ease-in-out",
                    originalImage ? "opacity-100" : "opacity-0 pointer-events-none" // Hide and disable interaction
                  )}
                >
                  {originalImage && (
                    <Card className="flex flex-col flex-shrink-0 shadow-none border-none"> {/* Removed card styles */}
                      <CardContent className="p-0 flex-grow"> {/* Removed padding */}
                        <ModelCustomization />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Generation History */}
                {/* Removed mt-auto and pt-6, let flex handle positioning */}
                <div className="min-h-0 flex-shrink-0 mt-auto"> {/* Use mt-auto to push down */}
                   <GenerationHistory />
                </div>
              </div>
            </Panel>

            {/* Removed PanelResizeHandle styling, using gap instead */}
            {/* <PanelResizeHandle className="w-[6px] bg-border hover:bg-primary cursor-col-resize transition-colors duration-200" /> */}

            {/* Panel 2: Original Image */}
            {/* Removed padding p-4, let ImageDisplayCard handle internal padding */}
            <Panel defaultSize={37.5} minSize={25} className="flex flex-col h-full overflow-hidden rounded-lg">
               <ImageDisplayCard type="original" />
            </Panel>

            {/* <PanelResizeHandle className="w-[6px] bg-border hover:bg-primary cursor-col-resize transition-colors duration-200" /> */}

            {/* Panel 3: Generated Image */}
            {/* Removed padding p-1 */}
             <Panel defaultSize={37.5} minSize={25} className="flex flex-col h-full overflow-hidden rounded-lg">
               <ImageDisplayCard type="generated" />
             </Panel>

          </PanelGroup>
        </div>

      </main>
    </div>
  );
}
