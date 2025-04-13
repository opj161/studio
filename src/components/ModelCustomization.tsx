"use client";

import { Gender, BodyType, AgeRange, Ethnicity, EnvironmentDescription, LightingStyle, LensStyle } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateClothingImage } from '@/app/actions';
// Removed Input import as it's not used
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Card imports as they are handled by the parent in page.tsx
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Loader2 } from 'lucide-react'; // Import spinner icon
console.log("ModelCustomization loaded");
import { useGenerationStore } from "@/lib/store";
import { toAppError } from "@/lib/errors"; // Assuming error helper exists

const ModelCustomization = () => {
  const {
    originalImage,
    modelSettings,
    setModelSettings,
    environmentSettings,
    setEnvironmentSettings,
    setGeneratedImage,
    addToHistory,
    isLoading, // Get isLoading state
    setLoading,
    setError
  } = useGenerationStore();

  const { gender, bodyType, ageRange, ethnicity } = modelSettings;
  const { description: environment, lighting, lensStyle: lens } = environmentSettings;

  const setGender = (value: string) => setModelSettings({ gender: value as Gender });
  const setBodyType = (value: string) => setModelSettings({ bodyType: value as BodyType });
  const setAgeRange = (value: string) => setModelSettings({ ageRange: value as AgeRange });
  const setEthnicity = (value: string) => setModelSettings({ ethnicity: value as Ethnicity });
  const setEnvironment = (value: string) => setEnvironmentSettings({ description: value as EnvironmentDescription });
  const setLighting = (value: string) => setEnvironmentSettings({ lighting: value as LightingStyle });
  const setLens = (value: string) => setEnvironmentSettings({ lensStyle: value as LensStyle });

  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!originalImage) {
        toast({
          title: "Error",
          description: "Please upload a clothing item first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = await generateClothingImage({
        clothingItemUrl: originalImage,
        modelGender: gender,
        modelBodyType: bodyType,
        modelAgeRange: ageRange,
        modelEthnicity: ethnicity,
        environmentDescription: environment,
        lightingStyle: lighting,
        lensStyle: lens,
      });

      if ('error' in result) {
        let description = result.error.message;
        const errorCode = result.error.code;
        const errorDetails = result.error.details;

        if (errorCode === 'VALIDATION_ERROR' && errorDetails?.field) {
          description = `Invalid input for ${errorDetails.field}: ${result.error.message}`;
        } else if (errorCode === 'API_ERROR') {
          description = `AI Service Error: ${result.error.message}`;
        } else if (errorCode === 'NETWORK_ERROR') {
           description = `Network Error: ${result.error.message}. Please check connection.`;
        } else if (errorCode === 'PROCESSING_ERROR') {
           description = `Image Processing Error: ${result.error.message}`;
        }

        setError({ message: description });
        toast({
          title: "Generation Failed",
          description: description,
          variant: "destructive",
        });
      } else if (result.generatedImageUrl && result.promptUsed) {
        setGeneratedImage(result.generatedImageUrl);
        addToHistory({
          originalImage: originalImage,
          generatedImage: result.generatedImageUrl
        });
        toast({
          title: "Image Generated",
          description: "Successfully generated image.",
        });
      } else {
        setError({ message: "Received an invalid response from the generation service" });
        toast({
          title: "Generation Failed",
          description: "Failed to generate image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error calling generateClothingImage action:", error);
      const appError = toAppError(error);
      setError({ message: appError.message });
      toast({
        title: "Error",
        description: appError.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // TODO: Wrap this return in an animation component (e.g., Framer Motion) for smooth appearance
  return (
    <div className="space-y-6"> {/* Added space-y */}
      <h2 className="text-lg font-semibold">Customize Model & Scene</h2>

      {/* Model Settings Group */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-muted-foreground">Model Details</h3>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="body-type">Body Type</Label>
          <Select value={bodyType} onValueChange={setBodyType}>
            <SelectTrigger id="body-type">
              <SelectValue placeholder="Select Body Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slim">Slim</SelectItem>
              <SelectItem value="athletic">Athletic</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="plus-size">Plus Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="age-range">Age Range</Label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger id="age-range">
              <SelectValue placeholder="Select Age Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-25">18-25</SelectItem>
              <SelectItem value="26-35">26-35</SelectItem>
              <SelectItem value="36-45">36-45</SelectItem>
              <SelectItem value="46-60">46-60</SelectItem>
              <SelectItem value="60+">60+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ethnicity">Ethnicity</Label>
          <Select value={ethnicity} onValueChange={setEthnicity}>
            <SelectTrigger id="ethnicity">
              <SelectValue placeholder="Select Ethnicity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caucasian">Caucasian</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="hispanic">Hispanic</SelectItem>
              <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Environment Settings Group */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-muted-foreground">Scene Details</h3>
        <div>
          <Label htmlFor="environment">Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger id="environment">
              <SelectValue placeholder="Select Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="urban">Urban</SelectItem>
              <SelectItem value="beach">Beach</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lighting">Lighting</Label>
          <Select value={lighting} onValueChange={setLighting}>
            <SelectTrigger id="lighting">
              <SelectValue placeholder="Select Lighting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="soft">Soft</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
              <SelectItem value="bright">Bright</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lens">Lens Style</Label>
          <Select value={lens} onValueChange={setLens}>
            <SelectTrigger id="lens">
              <SelectValue placeholder="Select Lens Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="editorial">Editorial</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full" // Removed mt-6 as parent div has space-y
        disabled={isLoading || !originalImage} // Also disable if no original image
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Image' // Changed text slightly
        )}
      </Button>
    </div>
  );
};

export default ModelCustomization;
