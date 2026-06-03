import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit to handle photos easily
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Endpoint 1: Generate Historical Narrative and scan for anachronisms
app.post("/api/time-travel/describe", async (req, res) => {
  try {
    const { username, eraName, eraYear, historicalRole, expression, customOutfit } = req.body;

    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      // Graceful local offline fallback so the application is fully functional even without a key!
      const mockNarrative = {
        journalEntry: `DIARY ENTRY - ${eraYear}\n\nDear Log, today I, ${username || 'Chrononaut'}, was seen in ${eraName} standing before the local folk as a ${historicalRole || 'Traveler'}. My expression of "${expression || 'awe'}" completely bemused the local crowd. They stared at me as if I dropped from a stellar vessel. Luckily, I wore some semblance of period-appropriate garb, though my modern posture was a dead giveaway!`,
        historicalContext: `${eraName} (circa ${eraYear}) was a time of immense historical transformation. The architecture, atmosphere, and societal rules of this era represent a legendary turning point in human records.`,
        anachronismScan: `Scanning ${username}... Humorous warning: Your modern dental fillings and lightweight synthetic footwear look extraordinarily wizard-like to the eyes of local denizens. Hide your smartphone before they accuse you of timeline sorcery!`,
        butterflyEffectRisk: Math.floor(Math.random() * 40) + 10,
        butterflyEffectWarning: `Take immediate action: Do NOT introduce zippers, carbonated soft drinks, or the concept of the internet to the high elders. Return to your temporal vessel if people start whispering.`
      };
      return res.json({ narrative: mockNarrative, offlineMode: true });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are an automated Time-Travel Security Terminal from the Year 3000 auditing the timeline.
      We have caught a time traveler in our camera logs. 
      Traveler details:
      - Name: ${username || "Unknown Scout"}
      - Era: ${eraName} (${eraYear})
      - Role they are playing: ${historicalRole}
      - Face Expression in photo: ${expression || "curious"}
      ${customOutfit ? `- Additional notes: ${customOutfit}` : ""}

      Analyze their appearance and write:
      1. A vivid, era-appropriate humorous diary entry or local archive note describing this character's sudden presence.
      2. Authentic and educational context explaining what was truly happening in ${eraName} during ${eraYear}.
      3. An "Anachronism Scan" checking for modern traits (e.g. plastic glasses, modern teeth, smartphones, clothes) with high humor.
      4. A "Butterfly Effect Risk" score expressed as a percentage value (0 to 100) and a cheeky cautionary directive.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        journalEntry: {
          type: Type.STRING,
          description: "Funny, extremely immersive era-appropriate diary entry of their adventures written in historical style."
        },
        historicalContext: {
          type: Type.STRING,
          description: "Interesting, educational fact about what actually happened back then."
        },
        anachronismScan: {
          type: Type.STRING,
          description: "Scan of modern tools, speech, patterns, dentists, sneakers or hair. High humor."
        },
        butterflyEffectRisk: {
          type: Type.INTEGER,
          description: "Integer value from 0 to 100 representing quantum risk level."
        },
        butterflyEffectWarning: {
          type: Type.STRING,
          description: "Cheeky warn directive of what they MUST do to avoid tearing the galaxy space-time."
        }
      },
      required: ["journalEntry", "historicalContext", "anachronismScan", "butterflyEffectRisk", "butterflyEffectWarning"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are the humorous, intelligent, highly accurate timeline warden auditing time travel anomalies."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedData = JSON.parse(text.trim());
    res.json({ narrative: parsedData });

  } catch (error: any) {
    console.error("Error generating narrative:", error);
    res.status(500).json({ error: error.message || "Timeline narration engine failed" });
  }
});

// Endpoint 2: Generate a custom background scene via gemini-2.1/2.5 flash-image
app.post("/api/time-travel/generate-scene", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback placeholder image that looks super clean and responds to the text!
      const seed = Math.floor(Math.random() * 100000);
      return res.json({
        imageUrl: `https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200&h=1200`,
        message: "Offline mode. Showing a beautiful vintage space-time clock fallback.",
        offlineMode: true
      });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Standard general image generation model
      contents: {
        parts: [
          {
            text: `High quality historical scene background without any people, faces, or frames. Setting: ${prompt}. Majestic, deeply authentic atmospheric textures, cinematic historical photo or elegant digital illustration style. Ensure there are blank spaces in the center-midground for a portrait overlay.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let base64Image = null;
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } else {
      // Try to find if candidate has text, or fallback
      console.warn("No inlineData returned; falling back to high-quality unsplash vintage search as fallback.");
      return res.json({
        imageUrl: `https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200&h=1200`,
        message: "Model response did not contain raw image parts. Displaying temporal gateway.",
        fallbackMode: true
      });
    }

  } catch (error: any) {
    console.error("Error generating scene:", error);
    res.status(500).json({ error: error.message || "Custom scene generator was disabled by security buffers" });
  }
});

// Vite Middleware & SPA serving
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Time-Travel Dispatch Server online on port ${PORT}`);
  });
}

initServer().catch(err => {
  console.error("Failed to start Time-Travel server:", err);
});
