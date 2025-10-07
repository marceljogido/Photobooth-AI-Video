import { GoogleGenAI, Modality } from "@google/genai";

// Utility function to convert data URL to base64
const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

const PROMPT = `Take this photo of the person or people against a plain background and transform it into a short, cinematic, looping video (a motion portrait). 
The subjects should exhibit subtle, confident motion, like a slow blink, a slight head turn, or a gentle smile, as if they are looking towards the future. 
Replace the plain background with a sleek, futuristic cityscape at dusk, inspired by a corporate summit aesthetic. The cityscape should feel alive, with shimmering lights, faint, slowly moving aerial traffic in the far distance, and subtle lenticular light flares that add depth and a sense of wonder.
The color palette should be dominated by deep purples (#8A5FBF), radiant oranges/golds (#FFC371), and calm blues (#77A6F7). 
The lighting must be cinematic and professional. The final video must be photorealistic and high-resolution.`;


export const applyStyleToImage = async (
  imageSrc: string,
  stylePrompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64ImageData = dataUrlToBase64(imageSrc);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: `Transform this portrait into a new image based on the following style, maintaining the subjects' core likenesses but adapting the art style completely. Style: ${stylePrompt}`,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("AI did not return a styled image. Please try a different style.");
};

export const generateMotionVideo = async (
  imageSrc: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64ImageData = dataUrlToBase64(imageSrc);

  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: PROMPT,
    image: {
      imageBytes: base64ImageData,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1
    }
  });

  while (!operation.done) {
    // Wait for 10 seconds before polling again, as video generation takes time.
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("AI did not return a video link. Please try again.");
  }

  // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};