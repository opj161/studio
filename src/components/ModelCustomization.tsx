"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { generateClothingImage } from '@/app/actions'; // Updated import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const ModelCustomization = () => {
  const [gender, setGender] = useState('Female');
  const [bodyType, setBodyType] = useState('Slim');
  const [ageRange, setAgeRange] = useState('20-30');
  const [ethnicity, setEthnicity] = useState('Caucasian');
  const [environment, setEnvironment] = useState('Studio');
  const [lighting, setLighting] = useState('Natural');
  const [lens, setLens] = useState('Standard');
  const [clothingItemUrl, setClothingItemUrl] = useState('https://pngimg.com/uploads/dress/dress_PNG33.png');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!clothingItemUrl) {
        toast({
          title: "Error",
          description: "Please enter a clothing item URL.",
          variant: "destructive",
        });
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

      console.log("clothingItemUrl being sent to AI:", clothingItemUrl)

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

      if (result && result.generatedImageUrl && result.promptUsed) {
        // Store the generated image URL and prompt in local storage
        localStorage.setItem('generatedImageUrl', result.generatedImageUrl);
        localStorage.setItem('prompt', result.promptUsed);

        // Store the generated image URL in local storage
        const storedHistory = localStorage.getItem('generationHistory');
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        const newHistory = [result.generatedImageUrl, ...history].slice(0, 5); // Limit to 5 items
        localStorage.setItem('generationHistory', JSON.stringify(newHistory));
        localStorage.setItem(`prompt_${result.generatedImageUrl}`, result.promptUsed);

        console.log("Generated Image URL:", result.generatedImageUrl);
        console.log("Prompt Used:", result.promptUsed);

        const newParams = new URLSearchParams(searchParams);
        newParams.set('image', result.generatedImageUrl);
        newParams.set('prompt', result.promptUsed);
        router.push(`/?${newParams.toString()}`);

        toast({
          title: "Image Generated",
          description: "Successfully generated image.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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
              <SelectItem value="Slim">Slim</SelectItem>
              <SelectItem value="Athletic">Athletic</SelectItem>
              <SelectItem value="Curvy">Curvy</SelectItem>
              <SelectItem value="Average">Average</SelectItem>
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
              <SelectItem value="10-20">10-20</SelectItem>
              <SelectItem value="20-30">20-30</SelectItem>
              <SelectItem value="30-40">30-40</SelectItem>
              <SelectItem value="40+">40+</SelectItem>
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
              <SelectItem value="Caucasian">Caucasian</SelectItem>
              <SelectItem value="African">African</SelectItem>
              <SelectItem value="Asian">Asian</SelectItem>
              <SelectItem value="Hispanic">Hispanic</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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
              <SelectItem value="Studio">Studio</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Urban">Urban</SelectItem>
              <SelectItem value="Beach">Beach</SelectItem>
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
              <SelectItem value="Natural">Natural</SelectItem>
              <SelectItem value="Artificial">Artificial</SelectItem>
              <SelectItem value="Soft">Soft"></SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
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
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Wide Angle">Wide Angle</SelectItem>
              <SelectItem value="Telephoto">Telephoto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSubmit} className="mt-6 w-full">Generate</Button>
    </div>
  );
};

export default ModelCustomization;
