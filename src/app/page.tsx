
import ClothingUpload from '@/components/ClothingUpload';
import ImageDisplay from '@/components/ImageDisplay';
import ModelCustomization from '@/components/ModelCustomization';
import GenerationHistory from '@/components/GenerationHistory';
import { Card, CardContent } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Fashion App</h1>
      <Grid numColumns={2} className="gap-6">
        <Card>
          <CardContent className="p-4">
            <ClothingUpload />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ModelCustomization />
          </CardContent>
        </Card>
      </Grid>
      <ImageDisplay />
      <GenerationHistory />
    </div>
  );
}
