# **App Name**: StyleAI

## Core Features:

- Clothing Upload: Upload an image of a single clothing item.
- Model Customization: Customize virtual model attributes (gender, body type, age range, ethnicity) and environment settings (background preset or custom description, lighting, lens/style).
- Image Generation: Generate a new image depicting the customized model wearing the provided clothing item in the specified environment using Google Gemini as a tool.
- Image Display: Display the generated image alongside the original upload for comparison, and the prompt used is shown.
- History: Maintain a history of recent generations (relative image URLs) in the user's browser local storage, displayed as a clickable thumbnail gallery.

## Style Guidelines:

- Primary color: Neutral white or light gray for a clean and modern look.
- Secondary color: A muted blue (#64B5F6) to provide a subtle accent.
- Accent: Teal (#26A69A) for interactive elements and highlights.
- Use a grid-based layout to maintain structure and alignment.
- Use simple, modern icons to represent different customization options.
- Subtle transitions when switching between customization options or loading generated images.

## Original User Request:
An web application that allows users to upload an image of a single clothing item. They can then customize virtual model attributes (gender, body type, age range, ethnicity) and environment settings (background preset or custom description, lighting, lens/style).
Upon clicking 'Generate', the application sends the uploaded image (as base64 data) and selected settings to a backend service. The backend constructs a prompt, uses an AI (specifically Google Gemini per the PRD) with multimodal input (image + text prompt) to generate a new image depicting the customized model wearing the provided clothing item in the specified environment.
The generated image is then displayed alongside the original upload for comparison, and the prompt used is shown. Successfully generated images are stored persistently on the server's local filesystem, with metadata saved in a local JSON file. A history of recent generations (relative image URLs) is maintained in the user's browser local storage, displayed as a clickable thumbnail gallery. The application is designed as a single-page app for anonymous users in its V1 implementation.
  