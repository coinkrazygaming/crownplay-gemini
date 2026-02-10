
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
 * Uses Gemini to curate the most exciting wins for the social ticker.
 */
export const curateSocialTicker = async (wins: WinTickerEntry[], maxItems: number): Promise<WinTickerEntry[] | null> => {
  try {
    const winList = wins.map(w => ({ id: w.id, player: w.playerName, amount: w.amount, game: w.gameName, currency: w.currency }));
    const prompt = `Here is a list of recent wins: ${JSON.stringify(winList)}. 
    Pick the ${maxItems} most "exciting" wins to show in the scrolling ticker. 
    Exciting means high amounts relative to others, variety in games, and a good mix of GC and SC.
    Return ONLY a JSON array of the IDs of the selected wins.`;

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
    console.error("Ticker curation error:", e);
    return wins.slice(0, maxItems);
  }
};

export const getAIGameRecommendation = async (games: any[], history: any[] = []) => {
  const gameNames = games.map(g => g.name).join(", ");
  const recentPlays = history.slice(0, 10).map(h => `${h.metadata} (${h.type === 'GAME_WIN' ? 'WIN' : 'LOSS'})`).join(", ");
  
  const prompt = `
    Player's Recent Games: [${recentPlays || 'No games played yet'}]
    CrownPlay Game Library: [${gameNames}]
    
    Task: Suggest exactly ONE game from the library that this player would enjoy next based on their history. 
    Format your response EXACTLY like this: GAME_NAME|REASON
  `;
  
  const result = await generateGeminiResponse(prompt, "You are an elite AI concierge. Be classy, data-driven, and persuasive.");
  const [name, reason] = result.split("|");
  return { 
    name: name.trim(), 
    reason: reason?.trim() || "Our royal analytics suggest you'll find great fortune here." 
  };
};

export const getSecurityReport = async (alerts: any[]) => {
  const alertSummary = alerts.map(a => `${a.type}: ${a.description} (${a.severity})`).join("\n");
  const prompt = `Analyze these system security alerts and provide a concise summary. Alerts: ${alertSummary || "No active alerts."}`;
  return await generateGeminiResponse(prompt, "You are the Sentinel AI Chief Security Officer.");
};

export const getWalletInsight = async (transactions: any[]) => {
  const summary = transactions.slice(0, 10).map(t => `${t.type}: ${t.amount} ${t.currency}`).join("\n");
  const prompt = `Analyze this user's recent transaction history and provide a "Royal Wallet Insight". History: ${summary || "No recent transactions."}`;
  return await generateGeminiResponse(prompt, "You are the Royal Treasury Auditor.");
};

export const getGameSimulationInsight = async (game: any) => {
  const prompt = `Analyze these slot game parameters: Name: ${game.name}, RTP: ${game.rtp}, Volatility: ${game.volatility}. Predict retention.`;
  return await generateGeminiResponse(prompt, "You are the Monarch's Game Mathematician.");
};
