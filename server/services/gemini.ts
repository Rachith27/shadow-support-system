import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODEL_NAME = "gemini-1.5-flash"; // Updated to actual current flash model string

export async function getChatResponse(messageHistory: { role: string; content: string }[]) {
    try {
        console.log("Calling Gemini API for chat response...");
        const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            systemInstruction: "You are a highly empathetic, non-judgmental youth support companion. Keep responses short, warm, and comforting. Never diagnose, prescribe, or offer unsolicited advice. Encourage them gently to seek real-world support if they feel overwhelmed. Maintain a conversational and safe tone."
        });

        // Convert our history format {role, content} to Gemini's {role, parts} format
        const historyForGemini = messageHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // The latest user message is the last one in the history
        const latestUserMsg = messageHistory[messageHistory.length - 1]?.content || "Hello";
        const previousContext = historyForGemini.slice(0, -1);

        const chat = model.startChat({
            history: previousContext,
            generationConfig: {
                temperature: 0.7,
            }
        });

        const result = await chat.sendMessage(latestUserMsg);
        const response = await result.response;
        
        console.log("Gemini response received!");
        return response.text();
    } catch (err: unknown) {
        console.error("Gemini Chat Error:", err instanceof Error ? err.message : String(err));
        return "I'm here to listen. Can you tell me more about how you're feeling?";
    }
}

export async function analyzeWellbeing(userText: string) {
    try {
        console.log("Calling Gemini API for wellbeing analysis...");
        const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            systemInstruction: `Analyze the student's text and return ONLY a valid JSON object matching this exact structure:
            {
              "emotion": (string - single emotion detected like 'anxious', 'sad', 'stressed'),
              "situation": (string - 3-5 word summary of the stressor or setting),
              "trigger": (string - 1-2 words identifying the core trigger),
              "supportNeed": (string - one of: 'emotional_support', 'academic_guidance', 'peer_mediation', 'family_counseling'),
              "riskLevel": (string - one of: 'low', 'medium', 'high')
            }
            Must be strict JSON formatting. No markdown blocks, no code ticks. Do not diagnose.`
        });

        const result = await model.generateContent(userText);
        const response = await result.response;
        let rawText = response.text().trim();
        
        // Clean markdown code blocks if any leak through
        if (rawText.startsWith("```json")) {
            rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        } else if (rawText.startsWith("```")) {
            rawText = rawText.replace(/```/g, "").trim();
        }

        try {
            return JSON.parse(rawText);
        } catch (jsonErr) {
            console.error("Failed to parse Gemini JSON:", rawText);
            throw jsonErr;
        }

    } catch (err: unknown) {
        console.error("Gemini Analysis Error:", err instanceof Error ? err.message : String(err));
        // Fallback guaranteed structured response
        return {
            emotion: "unknown",
            situation: "unknown",
            trigger: "unknown",
            supportNeed: "emotional_support",
            riskLevel: "low"
        };
    }
}
