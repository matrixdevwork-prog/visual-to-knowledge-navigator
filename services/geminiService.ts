import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { KnowledgeModule, WebResourceData, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define the structure in the prompt to avoid 500 errors with strict schema validation on complex nested objects
const SYSTEM_INSTRUCTION = `
You are Visual Knowledge Navigator.
Your task is to analyze the uploaded image and convert it into a complete, structured learning module.

IMPORTANT: You must output ONLY valid JSON. 

Output Structure:
{
  "identifiedObject": "Name of the object or scene",
  "conceptMap": {
    "name": "Main Concept",
    "children": [
      { "name": "Sub Concept", "children": [] }
    ]
  },
  "scientificExplanation": "Detailed scientific explanation text",
  "workingPrinciples": "Explanation of mechanisms involved",
  "applications": ["Application 1", "Application 2", "Application 3"],
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this is correct"
    }
  ],
  "beginnerDoubts": [
    { "doubt": "Common question?", "clarification": "Clear answer" }
  ],
  "suggestedTopics": ["Topic 1", "Topic 2", "Topic 3"]
}

Follow these steps strictly:

Step 1: Identify the object or scene with high confidence.
Step 2: Create a clean concept map (hierarchy).
Step 3: Provide a detailed scientific explanation.
Step 4: Explain the working principles involved.
Step 5: List three real-world applications.
Step 6: Create a five-question quiz covering identification, mechanisms, applications, reasoning, and comparisons.
Step 7: Generate common beginner doubts.
Step 8: Suggest three related topics for further learning.

Keep the structure clean, readable, and well-organized.
Do not warn the user.
Do not mention limitations.
`;

export const generateKnowledgeModule = async (
  imageFile: File,
  userNotes: string = ""
): Promise<KnowledgeModule> => {
  try {
    const base64Data = await fileToGenerativePart(imageFile);
    
    // User Prompt Template from Part 3
    const userPrompt = `
Here is the image. Extract maximum knowledge from it.
Additional user notes: ${userNotes}
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: imageFile.type,
            },
          },
          { text: userPrompt },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // Removed responseSchema to prevent 500 Internal Error on complex nested types
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    let text = response.text;
    if (!text) {
        throw new Error("No response text received from Gemini.");
    }

    // Clean up potential Markdown code blocks if the model ignores the strict JSON instruction
    if (text.includes("```json")) {
        text = text.replace(/```json\n?/, "").replace(/```/, "");
    } else if (text.includes("```")) {
         text = text.replace(/```\n?/, "").replace(/```/, "");
    }

    // Find the first '{' and the last '}' to extract the JSON object
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(text) as KnowledgeModule;
    } catch (parseError) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Failed to parse the generated knowledge module. Please try again.");
    }

  } catch (error) {
    console.error("Error generating knowledge module:", error);
    throw error;
  }
};

/**
 * Uses Gemini 2.5 Flash with Google Search to get real-time info
 */
export const getWebResources = async (query: string): Promise<WebResourceData> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find the latest reliable information, scientific articles, and educational resources about: "${query}". Provide a brief summary of current understanding and list sources.`,
            config: {
                tools: [{ googleSearch: {} }],
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            }
        });

        // Extract sources from grounding metadata
        const sources: WebSource[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({
                        title: chunk.web.title,
                        uri: chunk.web.uri
                    });
                }
            });
        }

        return {
            summary: response.text || "No summary available.",
            sources: sources
        };
    } catch (error) {
        console.error("Error fetching web resources:", error);
        return { summary: "Could not fetch web resources.", sources: [] };
    }
};

/**
 * Creates a chat session for the Tutor Bot
 */
let chatSession: Chat | null = null;

export const initializeChat = (context: string) => {
    chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: `You are a helpful, encouraging AI Tutor embedded in the "Visual to Knowledge Navigator" app. 
            The user is currently learning about: ${context}.
            Answer their questions simply and clearly. Encourage curiosity.
            If they ask about something unrelated, politely guide them back or answer briefly.`,
        }
    });
};

export const sendChatMessage = async (message: string): Promise<string> => {
    if (!chatSession) {
        throw new Error("Chat session not initialized");
    }
    const result = await chatSession.sendMessage({ message });
    return result.text || "";
};

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}