import { SignJWT } from 'jose';
import { MARKETING_THEMES, TEXT_SYSTEM_INSTRUCTION, ART_STYLES, BACKGROUND_SETTINGS } from "../constants";

const API_KEY = import.meta.env.VITE_ZHIPU_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_ZHIPU_API_KEY : '') || '';

// --- JWT Helper ---
const generateToken = async (): Promise<string> => {
    if (!API_KEY) {
        console.error("VITE_ZHIPU_API_KEY is missing. Env:", import.meta.env);
        throw new Error("Missing VITE_ZHIPU_API_KEY. If you are on Vercel, please check your Environment Variables in Settings and then REDEPLOY.");
    }
    const parts = API_KEY.split('.');
    if (parts.length !== 2) throw new Error("Invalid Zhipu API Key format");

    const [id, secret] = parts;

    const secretKey = new TextEncoder().encode(secret);
    return new SignJWT({ api_key: id, timestamp: Date.now() })
        .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
        .setExpirationTime('5m') // Short expiration is fine for per-request
        .sign(secretKey);
};

// --- Retry Helper ---
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

// --- API Implementation ---

/**
 * Generates an image using Zhipu CogView-3
 */
export const generateMarketingImage = async (): Promise<{ imageUrl: string; description: string; theme: string }> => {
    return retryOperation(async () => {
        const token = await generateToken();

        // 1. Select Random Theme, Style, Setting
        const randomThemeIndex = Math.floor(Math.random() * MARKETING_THEMES.length);
        const selectedTheme = MARKETING_THEMES[randomThemeIndex];

        const randomStyleIndex = Math.floor(Math.random() * ART_STYLES.length);
        const selectedStyle = ART_STYLES[randomStyleIndex];

        const randomSettingIndex = Math.floor(Math.random() * BACKGROUND_SETTINGS.length);
        const selectedSetting = BACKGROUND_SETTINGS[randomSettingIndex];

        const prompt = `
      Create a high-quality educational concept illustration.
      Theme: ${selectedTheme.prompt}.
      Setting: ${selectedSetting}.
      Style: ${selectedStyle}.
      Requirements: Clean composition, suitable for social media marketing, aesthetic, inspiring.
    `;

        console.log(`[Zhipu] Generating image. Theme: ${selectedTheme.label}`);

        const response = await fetch('/zhipu-api/paas/v4/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'cogview-3-plus', // Using the latest plus model
                prompt: prompt,
                size: '1024x1024'
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Zhipu Image API Failed: ${errText}`);
        }

        const data = await response.json();
        if (!data.data || !data.data[0] || !data.data[0].url) {
            throw new Error("Invalid response from Zhipu Image API");
        }

        return {
            imageUrl: data.data[0].url,
            description: selectedTheme.descriptionForTextAI,
            theme: selectedTheme.label
        };
    }, 2, 1000);
};

/**
 * Analyzes image using Zhipu GLM-4V
 */
export const analyzeImageForDescription = async (base64Image: string): Promise<string> => {
    return retryOperation(async () => {
        const token = await generateToken();
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        const response = await fetch('/zhipu-api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "glm-4v-plus", // Use vision model
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "请简要描述这张图片的内容，重点描述其中的教育隐喻、物体和氛围。50字以内。"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: cleanBase64 // Zhipu supports base64 in url field directly for some endpoints or standard base64 structure? 
                                    // Docs say: "type": "image_url", "image_url": {"url": "base64 contents"} is supported for GLM-4V
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Zhipu Vision API Failed: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No description generated by Zhipu.");

        return content;
    }, 2, 1000);
};

/**
 * Generates Marketing Text using Zhipu GLM-4 (Better Chinese Marketing)
 */
export const generateMarketingText = async (
    base64OrUrl: string, // Unused in text generation if we just use description, but kept for interface compatibility
    sellingPoint: string,
    imageDescription: string
): Promise<string[]> => {
    return retryOperation(async () => {
        const token = await generateToken();

        const prompt = `
      你是51Talk的资深朋友圈营销文案专家。请根据以下信息写一条朋友圈文案。
      
      【视觉隐喻/图片描述】: "${imageDescription}"
      【必须植入的卖点】: "${sellingPoint}"
      
      要求：
      1. 第一段：解读视觉隐喻，引出教育痛点（如时间紧迫性、复利效应等）。(40-50字)
      2. 第二段：自然通过逻辑转折，植入51Talk的卖点解决方案。
      3. 第三段：精炼总结，仅一句金句加号召。
      
      文风：要有“小红书”或“私域”感，像真人分享，专业且有温度。不要太硬广。
      格式：返回JSON数组，包含3个字符串，分别对应三段话。
      注意：每段开头和结尾都要带一个emoji。
      
      Output JSON Format: { "paragraphs": ["string", "string", "string"] }
    `;

        const response = await fetch('/zhipu-api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "glm-4-plus",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
                temperature: 0.7,
                // JSON mode enforcement if supported, otherwise we rely on prompt
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Zhipu Text API Failed: ${errText}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        // Parse JSON from text (it might be wrapped in ```json ... ```)
        if (content.startsWith('```')) {
            content = content.replace(/```json\n?|```/g, '');
        }

        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.paragraphs)) {
                return parsed.paragraphs;
            } else if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.warn("Failed to parse JSON from Zhipu, returning raw split", content);
        }

        // Fallback if not proper JSON
        return content.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);

    }, 2, 1000);
};
