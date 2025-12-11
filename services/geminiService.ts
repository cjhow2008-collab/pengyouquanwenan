import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MARKETING_THEMES, TEXT_SYSTEM_INSTRUCTION, ART_STYLES, BACKGROUND_SETTINGS, MarketingTheme } from "../constants";

/**
 * Helper to get the AI client, initializing it lazily.
 * This prevents app crash if API key is missing.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Google Gemini API Key is missing. Please configure it in settings or use Zhipu AI.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to retry an async operation with exponential backoff
 */
async function retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 2, delayMs: number = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      lastError = error;

      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

/**
 * Generates an image based on a randomly selected educational concept AND a random art style.
 */
export const generateMarketingImage = async (): Promise<{ imageUrl: string; description: string; theme: string }> => {
  return retryOperation(async () => {
    const ai = getAIClient();

    // 1. Randomly select a theme/concept (The "What")
    const randomThemeIndex = Math.floor(Math.random() * MARKETING_THEMES.length);
    const selectedTheme = MARKETING_THEMES[randomThemeIndex];

    // 2. Randomly select an art style (The "Look")
    const randomStyleIndex = Math.floor(Math.random() * ART_STYLES.length);
    const selectedStyle = ART_STYLES[randomStyleIndex];

    // 3. Randomly select a background setting (The "Where")
    const randomSettingIndex = Math.floor(Math.random() * BACKGROUND_SETTINGS.length);
    const selectedSetting = BACKGROUND_SETTINGS[randomSettingIndex];

    // 4. Combine them into a rich, varied prompt
    // We emphasize "Xiaohongshu" / "Instagram" aesthetics: clean, bright, high quality.
    const finalPrompt = `
      Create a high-quality educational concept illustration for social media (like Instagram or Xiaohongshu).
      
      CONCEPT: ${selectedTheme.prompt}.
      SETTING: ${selectedSetting}.
      ART STYLE: ${selectedStyle}.
      
      CRITICAL INSTRUCTIONS:
      - The image must be visually striking, suitable for a marketing poster.
      - Ensure text labels (like 'INPUT', 'TIME', 'ENGLISH') are minimal, spelled correctly, and integrated artistically.
      - Color palette should be harmonious and aesthetically pleasing (e.g., Morandi colors, bright pastels, or clean high-contrast).
      - Composition should leave some breathing room, not too cluttered.
    `;

    console.log(`Generating image. Theme: ${selectedTheme.label} [${selectedTheme.category}], Style: ${selectedStyle}`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let imageUrl = '';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          console.warn("Model returned text instead of image:", part.text);
        }
      }
    }

    if (!imageUrl) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Image generation blocked. Reason: ${finishReason}`);
      }
      throw new Error("No image data received from API. The model may have refused the prompt.");
    }

    return {
      imageUrl,
      description: selectedTheme.descriptionForTextAI,
      theme: selectedTheme.label
    };
  }, 2, 1000);
};

/**
 * Automatically analyzes an image to provide a concise text description.
 */
export const analyzeImageForDescription = async (base64Image: string): Promise<string> => {
  return retryOperation(async () => {
    const ai = getAIClient();
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `Describe this image concisely and neutrally, focusing on key objects, themes, and educational metaphors if present. Limit the description to a maximum of 50 Chinese characters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG, but could be dynamic from file.type if needed
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        temperature: 0.2, // Keep description factual
        maxOutputTokens: 100, // Small output
      },
    });

    const text = response.text;
    if (!text) throw new Error("无法分析图片内容以生成描述。");
    return text.trim();
  }, 2, 1000);
};


/**
 * Generates the 3-paragraph marketing text based on the image metaphor and a selling point.
 */
export const generateMarketingText = async (
  base64Image: string,
  sellingPoint: string,
  imageDescription: string // Now this will be an AI-generated description for uploaded images
): Promise<string[]> => {
  return retryOperation(async () => {
    const ai = getAIClient();
    // Remove data:image/png;base64, prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `
      The attached image is a visual metaphor for English learning: "${imageDescription}".
      
      Write a 3-paragraph marketing post for WeChat Moments (朋友圈).
      
      Structure:
      1. Paragraph 1: Interpret the visual metaphor (e.g., urgency of time, the compound effect of persistence). Keep this paragraph VERY CONCISE (approx 40-50 Chinese characters).
      2. Paragraph 2: Transition to 51Talk's solution. You MUST seamlessly integrate this specific advantage: "${sellingPoint}".
      3. Paragraph 3: A short, punchy summary and a call to action.
      
      FORMATTING RULES:
      - You MUST add an emoji at the BEGINNING and at the END of EVERY paragraph.
      
      Tone: Professional, Insightful (educational expert vibe), Encouraging.
      Language: Simplified Chinese.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        paragraphs: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "The three paragraphs of the marketing copy.",
        },
      },
      required: ["paragraphs"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: TEXT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text generated");

    const result = JSON.parse(jsonText);
    return result.paragraphs;
  });
};