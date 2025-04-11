"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateClothingImage } from '@/app/actions';
import { GenerateClothingImageInput } from '@/types/actions';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useGenerationStore } from "@/lib/store";

const ModelCustomization = () => {
  // Local state for clothing item URL
  const [clothingItemUrl, setClothingItemUrl] = useState('https://pngimg.com/uploads/dress/dress_PNG33.png');

  // Get model and environment settings from the store
  const {
    modelSettings,
    setModelSettings,
    environmentSettings,
    setEnvironmentSettings
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
  const {
    setGeneratedImage,
    addToHistory,
    setLoading,
    setError,
    setGenerationProgress,
    modelSettings,
    setModelSettings,
    environmentSettings,
    setEnvironmentSettings
  } = useGenerationStore();

  const handleSubmit = async () => {
    try {
      // Reset any previous errors
      setError(null);

      // Start loading state
      setLoading(true);
      setGenerationProgress(10); // Initial progress

      // Set up progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (!prev) return 10;
          // Increment by small amounts until we reach 80%
          return prev >= 80 ? 80 : prev + 2;
        });
      }, 800);

      // Validate inputs
      if (!clothingItemUrl) {
        toast({
          title: "Error",
          description: "Please enter a clothing item URL.",
          variant: "destructive",
        });
        setLoading(false);
        clearInterval(progressInterval);
        setGenerationProgress(0);
        return;
      }

      // Store clothing item URL and model attributes in local storage
      localStorage.setItem('clothingItemUrl', clothingItemUrl);
      localStorage.setItem('modelGender', gender);
      localStorage.setItem('modelBodyType', bodyType);
      localStorage.setItem('modelAgeRange', ageRange);
      localStorage.setItem('modelEthnicity', ethnicity);
      localStorage.setItem('environmentDescription', environment);
      localStorage.setItem('lightingStyle', lighting);
      localStorage.setItem('lensStyle', lens);

      // Update progress
      setGenerationProgress(30);

      // Call the generation function with values from the store
      const result = await generateClothingImage({
        clothingItemUrl,
        modelGender: gender,
        modelBodyType: bodyType,
        modelAgeRange: ageRange,
        modelEthnicity: ethnicity,
        environmentDescription: environment,
        lightingStyle: lighting,
        lensStyle: lens,
      });

      // Update progress
      setGenerationProgress(80);

      if ('error' in result) {
        // Handle error response
        setError({ message: result.error.message });
        toast({
          title: "Generation Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (result.generatedImageUrl && result.promptUsed) {
        // Handle successful generation
        setGenerationProgress(100);

        // Store the generated image URL, prompt, and timestamp in local storage
        localStorage.setItem('generatedImageUrl', result.generatedImageUrl);
        localStorage.setItem('prompt', result.promptUsed);
        localStorage.setItem('generationTimestamp', Date.now().toString());

        // Update the store
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
      console.error("Error generating image:", error);
      setError({ message: error.message || "An unexpected error occurred" });
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always reset loading state
      setLoading(false);
      // Clear the progress interval
      clearInterval(progressInterval);
      // Reset progress after a delay to show completion
      setTimeout(() => setGenerationProgress(0), 1500);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Customize Model</h2>

      <div className="grid gap-4">
         <div>
          <Label htmlFor="clothing-url">Clothing URL</Label>
          <Input
            id="clothing-url"
            type="text"
            value={clothingItemUrl}
            onChange={(e) => setClothingItemUrl(e.target.value)}
            placeholder="Enter clothing item URL"
          />
        </div>
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

      {generationProgress > 0 && (
        <div className="mt-4">
          <LoadingIndicator
            status="loading"
            message={generationProgress === 100 ? "Generation complete!" : "Generating image..."}
            progress={generationProgress}
            variant="primary"
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full"
        disabled={generationProgress > 0}
      >
        Generate
      </Button>
    </div>
  );
};

export default ModelCustomization;
