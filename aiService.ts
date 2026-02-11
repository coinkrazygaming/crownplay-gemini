
import { GoogleGenAI, Type } from "@google/genai";
import { WinTickerEntry } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGeminiResponse = async (prompt: string, systemInstruction: string = "You are the Royal Concierge for CrownPlay, a premium social casino. Be elegant, helpful, and sophisticated.") => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "I apologize, your Majesty, but my connection to the royal library is temporarily interrupted.";
  }
};

/**
 * Generates a studio-grade game specification following the high-power Builder-ready prompt format.
 */
export const generateStudioGameSpec = async (cloneUrl: string, vision: string) => {
  const prompt = `
    MASTER PROMPT EXECUTION:
    Context: Building a high-end social casino game for "CrownPlay".
    Target Platform: Web/Mobile.
    
    Vision Input: ${vision}
    Reference Source: ${cloneUrl}
    
    TASK: Generate a complete JSON specification for a new slot game.
    The math model should be balanced for high retention.
    The asset manifest should describe luxury themes.
    
    REQUIRED JSON STRUCTURE:
    {
      "name": "Game Title",
      "description": "Premium description",
      "mathModel": {
        "symbolWeights": {"A": 10, "B": 20, ...},
        "paytable": {"A": [0,0,10,50,200], ...},
        "paylines": 20,
        "hitFrequency": 0.28,
        "volatilityRating": "HIGH",
        "maxWinMultiplier": 5000
      },
      "assetManifest": {
        "symbols": {"A": "symbol_url_or_emoji", ...},
        "background": "detailed_aesthetic_description",
        "animations": ["name_of_animation_trigger"]
      },
      "reelsConfig": ["emoji1", "emoji2", ...],
      "featureSet": ["Expanding Wilds", "Respin on 3 Scatters"],
      "rtp": 0.96,
      "volatility": "HIGH",
      "themeColor": "#hex_accent"
    }
  `;
  
  const result = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are the Lead Game Mathematician and Studio Director at CrownPlay Studios. Output valid JSON only.",
      responseMimeType: "application/json"
    }
  });
  
  return JSON.parse(result.text);
};

export const curateSocialTicker = async (wins: WinTickerEntry[], maxItems: number): Promise<WinTickerEntry[] | null> => {
  try {
    const winList = wins.map(w => ({ id: w.id, player: w.playerName, amount: w.amount, game: w.gameName, currency: w.currency }));
    const prompt = `Curate the ${maxItems} most exciting wins from: ${JSON.stringify(winList)}. Return ONLY a JSON array of IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const selectedIds = JSON.parse(response.text);
    return wins.filter(w => selectedIds.includes(w.id));
  } catch (e) {
    return wins.slice(0, maxItems);
  }
};

export const getAIGameRecommendation = async (games: any[], history: any[] = []) => {
  const gameNames = games.map(g => g.name).join(", ");
  const recentPlays = history.slice(0, 10).map(h => `${h.metadata} (${h.type === 'GAME_WIN' ? 'WIN' : 'LOSS'})`).join(", ");
  
  const prompt = `
    Player History: [${recentPlays}]
    Library: [${gameNames}]
    Suggest exactly ONE game: GAME_NAME|REASON
  `;
  
  const result = await generateGeminiResponse(prompt, "You are an elite AI concierge.");
  const [name, reason] = result.split("|");
  return { name: name.trim(), reason: reason?.trim() || "Analyzed as your next big win." };
};

export const getWalletInsight = async (transactions: any[]) => {
  const summary = transactions.slice(0, 10).map(t => `${t.type}: ${t.amount} ${t.currency}`).join("\n");
  const prompt = `Analyze this user's recent activity and provide a royal financial summary. History: ${summary || "No recent activity."}`;
  return await generateGeminiResponse(prompt, "You are the Royal Treasury Auditor.");
};

export const auditIdentityVault = async (docs: any) => {
  const prompt = `Review this identity status. ID: ${!!docs.idFront}, POA: ${!!docs.proofOfAddress}, Payment: ${!!docs.paymentProof}. Provide a verdict.`;
  return await generateGeminiResponse(prompt, "You are the Sovereign Identity Auditor.");
};
