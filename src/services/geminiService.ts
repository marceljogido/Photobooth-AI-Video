import { GoogleGenAI, Modality } from "@google/genai";

// Utility function to convert data URL to base64
const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

const PROMPT = `Take the uploaded photobooth image of the subject and transform it into a 6-second, cinematic, looping video. The video should begin with the subject in a normal, static pose for 1-2 seconds, then subtly transition as their expression shifts to surprise and intense spiciness—eyes widening, face reddening. The subject should then exclaim, "Pedes gilaaakkk!" (meaning "Crazy spicy!"). Immediately after the exclamation, a realistic or cartoon-like burst of fire should emerge from their mouth for 1-2 seconds. The background should retain elements from the original photo but with gentle, ambient motion (e.g., subtle shimmering lights, slow-moving particles). The camera should maintain the original photobooth angle but with subtle cinematic movements like a slow zoom or gentle pan, especially during the expression change and fire effect. Total duration should be approximately 6 seconds.`;


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
    model: 'gemini-2.5-flash-image',
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

  try {
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

    console.log("Video generation started, operation:", operation.name);

    while (!operation.done) {
      // Wait for 10 seconds before polling again, as video generation takes time.
      console.log("Polling for video generation status...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    console.log("Operation response:", operation.response);
    console.log("Generated videos:", operation.response?.generatedVideos);
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      console.error("No download link found in response:", operation.response);
      throw new Error("AI did not return a video link. This may be due to the model not being available or the API key not having access to video generation. Please try again or check your API configuration.");
    }

    console.log("Download link received:", downloadLink);

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error) {
    console.error("Error in generateMotionVideo:", error);
    if (error instanceof Error) {
      throw new Error(`Video generation failed: ${error.message}`);
    } else {
      throw new Error("Video generation failed with an unknown error");
    }
  }
};

// Fungsi baru untuk upload video ke server
export const uploadVideoToServer = async (videoUrl: string): Promise<string> => {
  try {
    console.log("Memulai upload video ke server, URL:", videoUrl);
    
    // Ambil blob dari URL video
    const response = await fetch(videoUrl);
    console.log("Response fetch video:", response.ok, response.status);
    if (!response.ok) {
      throw new Error(`Gagal mengambil video: ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log("Blob size:", blob.size, "type:", blob.type);
    
    // Buat FormData untuk upload
    const formData = new FormData();
    formData.append('video', blob, 'generated-video.mp4');
    
    // Kirim ke endpoint upload server
    const uploadResponse = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log("Upload response:", uploadResponse.status, uploadResponse.ok);
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload error response:", errorText);
      throw new Error(`Gagal mengupload video ke server: ${uploadResponse.status} ${errorText}`);
    }
    
    const result = await uploadResponse.json();
    console.log("Upload result:", result);

    const rawDownloadUrl: unknown = result.downloadUrl;
    if (typeof rawDownloadUrl !== 'string' || rawDownloadUrl.length === 0) {
      throw new Error("Server tidak mengembalikan downloadUrl yang valid.");
    }

    let absoluteDownloadUrl: string;
    if (/^https?:\/\//i.test(rawDownloadUrl)) {
      absoluteDownloadUrl = rawDownloadUrl;
    } else if (typeof window !== 'undefined' && window.location) {
      absoluteDownloadUrl = new URL(rawDownloadUrl, window.location.origin).toString();
    } else {
      throw new Error("Tidak dapat menentukan URL absolut untuk download video.");
    }

    return absoluteDownloadUrl; // URL yang bisa digunakan untuk download
  } catch (error) {
    console.error("Error dalam uploadVideoToServer:", error);
    throw error;
  }
};
