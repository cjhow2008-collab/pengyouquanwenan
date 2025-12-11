import { SignJWT } from 'jose';

// Vercel Serverless Function to generate Zhipu AI Token
// This runs on the server side, keeping the API Key secure.
export default async function handler(request, response) {
    // 1. Try to get key from Environment Variables (Best Practice)
    let apiKey = process.env.VITE_ZHIPU_API_KEY;

    // 2. Fallback: Hardcoded key for immediate user testing (Temporary)
    // Note: It is recommended to only use Environment Variables in production.
    if (!apiKey) {
        console.warn("Using hardcoded fallback key. Please configure VITE_ZHIPU_API_KEY in Vercel.");
        apiKey = "3984c146532248ceb77fd47a463dcebb.p2yNjD865mg0a3E8";
    }

    if (!apiKey) {
        return response.status(500).json({ error: "Server Error: Zhipu API Key not configured." });
    }

    try {
        const [id, secret] = apiKey.split('.');
        if (!id || !secret) throw new Error("Invalid Key Format");

        const secretKey = new TextEncoder().encode(secret);
        const token = await new SignJWT({ api_key: id, timestamp: Date.now() })
            .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
            .setExpirationTime('5m')
            .sign(secretKey);

        return response.status(200).json({ token });
    } catch (error) {
        console.error("Token generation failed:", error);
        return response.status(500).json({ error: "Failed to generate token" });
    }
}
