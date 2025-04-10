"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid } from "@/components/ui/grid";

const ImageDisplay = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [clothingItemUrl, setClothingItemUrl] = useState<string | null>(null);
  const [modelGender, setModelGender] = useState<string | null>(null);
  const [modelBodyType, setModelBodyType] = useState<string | null>(null);
  const [modelAgeRange, setModelAgeRange] = useState<string | null>(null);
  const [modelEthnicity, setModelEthnicity] = useState<string | null>(null);
  const [environmentDescription, setEnvironmentDescription] = useState<string | null>(null);
  const [lightingStyle, setLightingStyle] = useState<string | null>(null);
  const [lensStyle, setLensStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Retrieve data from local storage
    const image = localStorage.getItem('generatedImageUrl');
    const promptText = localStorage.getItem('prompt');
    const clothingItem = localStorage.getItem('clothingItemUrl');
    const gender = localStorage.getItem('modelGender');
    const body = localStorage.getItem('modelBodyType');
    const age = localStorage.getItem('modelAgeRange');
    const ethnicity = localStorage.getItem('modelEthnicity');
    const environment = localStorage.getItem('environmentDescription');
    const lighting = localStorage.getItem('lightingStyle');
    const lens = localStorage.getItem('lensStyle');

    if (image && promptText && clothingItem && gender && body && age && ethnicity && environment && lighting && lens) {
      setGeneratedImage(image);
      setPrompt(promptText);
      setClothingItemUrl(clothingItem);
      setModelGender(gender);
      setModelBodyType(body);
      setModelAgeRange(age);
      setModelEthnicity(ethnicity);
      setEnvironmentDescription(environment);
      setLightingStyle(lighting);
      setLensStyle(lens);
      setLoading(false);
    } else {
      setGeneratedImage(null);
      setPrompt(null);
      setClothingItemUrl(null);
      setModelGender(null);
      setModelBodyType(null);
      setModelAgeRange(null);
      setModelEthnicity(null);
      setEnvironmentDescription(null);
      setLightingStyle(null);
      setLensStyle(null);
      setLoading(false);
      setError("No image generated yet. Customize your model and upload a clothing item to generate an image.");
    }
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">Generated Image</h2>
      {loading ? (
        <Grid numColumns={2} className="gap-6">
           <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>The loading indicator</CardDescription>
            </CardHeader>
             <CardContent>
              <Skeleton className="w-full aspect-square" />
             </CardContent>
           </Card>
           <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
              <CardDescription>The loading indicator</CardDescription>
            </CardHeader>
             <CardContent>
              <Skeleton className="w-full h-20" />
             </CardContent>
           </Card>
        </Grid>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : generatedImage && prompt ? (
        <Grid numColumns={2} className="gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><b>Prompt:</b> {prompt}</p>
              <p><b>Clothing URL:</b> {clothingItemUrl}</p>
              <p><b>Gender:</b> {modelGender}</p>
              <p><b>Body Type:</b> {modelBodyType}</p>
              <p><b>Age Range:</b> {modelAgeRange}</p>
              <p><b>Ethnicity:</b> {modelEthnicity}</p>
              <p><b>Environment:</b> {environmentDescription}</p>
              <p><b>Lighting:</b> {lightingStyle}</p>
              <p><b>Lens Style:</b> {lensStyle}</p>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        <p className="text-center">No image generated yet. Customize your model and upload a clothing item to generate an image.</p>
      )}
    </div>
  );
};

export default ImageDisplay;
