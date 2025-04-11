"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateClothingImage } from '@/app/actions';
// GenerateClothingImageInput is now imported via store or types/actions
import { Input } from "@/components/ui/input"; // Keep Input for other fields if needed
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useGenerationStore } from "@/lib/store";

import { useGenerationStore } from "@/lib/store";

const ModelCustomization = () => {
  // Get model, environment settings, and originalImage from the store
  const {
    originalImage, // Get the uploaded image (base64)
    modelSettings,
    setModelSettings,
    environmentSettings,
    setEnvironmentSettings,
    setGeneratedImage,
    addToHistory,
    setLoading,
    setError
    // Remove setGenerationProgress
  } = useGenerationStore();

  // Destructure settings for easier access
  const { gender, bodyType, ageRange, ethnicity } = modelSettings;
  const { description: environment, lighting, lensStyle: lens } = environmentSettings;

  // Create setter functions that update the store
  const setGender = (value: string) => setModelSettings({ gender: value });
  const setBodyType = (value: string) => setModelSettings({ bodyType: value });
  const setAgeRange = (value: string) => setModelSettings({ ageRange: value });
  const setEthnicity = (value: string) => setModelSettings({ ethnicity: value });
  const setEnvironment = (value: string) => setEnvironmentSettings({ description: value });
  const setLighting = (value: string) => setEnvironmentSettings({ lighting: value });
  const setLens = (value: string) => setEnvironmentSettings({ lensStyle: value });
  const { toast } = useToast();
  // Store actions are already destructured above

  const handleSubmit = async () => {
    try {
      // Reset any previous errors
      setError(null);

      // Start loading state
      setLoading(true);
      // Remove setGenerationProgress call
      // setGenerationProgress(10);

      // Remove progress simulation interval
      // const progressInterval = setInterval(() => { ... }, 800);

      // Validate inputs - Check for originalImage from the store
      if (!originalImage) {
        toast({
          title: "Error",
          description: "Please upload a clothing item first.",
          variant: "destructive",
        });
        setLoading(false);
        // Remove interval clearing and progress reset
        // clearInterval(progressInterval);
        // setGenerationProgress(0);
        return;
      }

      // Remove manual localStorage saving - Zustand persist handles settings/history
      // localStorage.setItem('clothingItemUrl', clothingItemUrl); // REMOVE
      // localStorage.setItem('modelGender', gender); // REMOVE
      // localStorage.setItem('modelBodyType', bodyType); // REMOVE
      // localStorage.setItem('modelAgeRange', ageRange); // REMOVE
      // localStorage.setItem('modelEthnicity', ethnicity); // REMOVE
      // localStorage.setItem('environmentDescription', environment); // REMOVE
      // localStorage.setItem('lightingStyle', lighting); // REMOVE
      // localStorage.setItem('lensStyle', lens); // REMOVE

      // Update progress (will be removed later)
      setGenerationProgress(30);

      // Call the generation function with originalImage (base64) from the store
      const result = await generateClothingImage({
        clothingItemUrl: originalImage, // Pass the base64 Data URI
        modelGender: gender,
        modelBodyType: bodyType,
        modelAgeRange: ageRange,
        modelEthnicity: ethnicity,
        environmentDescription: environment,
        lightingStyle: lighting,
        lensStyle: lens,
      });

      // Remove progress update
      // setGenerationProgress(80);

      if ('error' in result) {
        // Handle error response with more detail
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
        // Add more specific cases as needed

        setError({ message: description }); // Set potentially more specific message in store
        toast({
          title: "Generation Failed",
          description: description, // Use the potentially enhanced description
          variant: "destructive",
        });
      } else if (result.generatedImageUrl && result.promptUsed) {
        // Handle successful generation
        setGenerationProgress(100); // Will be removed later

        // Remove manual localStorage saving
        // localStorage.setItem('generatedImageUrl', result.generatedImageUrl); // REMOVE
        // localStorage.setItem('prompt', result.promptUsed); // REMOVE (prompt not stored anyway)
        // localStorage.setItem('generationTimestamp', Date.now().toString()); // REMOVE

        // Update the store with the result (which will soon be a persistent URL)
        setGeneratedImage(result.generatedImageUrl);

        // Add to history in the store
        addToHistory({
          originalImage: clothingItemUrl,
          generatedImage: result.generatedImageUrl
        });

        // The results will be displayed in the ImageDisplay component through the store

        toast({
          title: "Image Generated",
          description: "Successfully generated image.",
        });
      } else {
        // Handle unexpected response format
        setError({ message: "Received an invalid response from the generation service" });
        toast({
          title: "Generation Failed",
          description: "Failed to generate image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
      // Handle unexpected errors during the action call itself
      console.error("Error calling generateClothingImage action:", error);
      const appError = toAppError(error); // Use error helper
      setError({ message: appError.message });
      toast({
        title: "Error",
        description: appError.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always reset loading state
      setLoading(false);
      // Remove interval clearing and progress reset
      // clearInterval(progressInterval);
      // setTimeout(() => setGenerationProgress(0), 1500);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Customize Model</h2>

      <div className="grid gap-4">
         {/* Remove the Clothing URL input field */}
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

      {/* Remove the conditional LoadingIndicator based on generationProgress */}
      {/* Loading state will be handled by ImageDisplay */}

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={isLoading} // Disable button based on isLoading state from store
      >
        {isLoading ? 'Generating...' : 'Generate'} {/* Optionally change button text */}
      </Button>
    </div>
  );
};

export default ModelCustomization;
