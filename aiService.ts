
import { GoogleGenAI } from "@google/genai";

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

export const getAIGameRecommendation = async (games: any[], history: any[] = []) => {
  const gameNames = games.map(g => g.name).join(", ");
  
  // Format history for context
  const recentPlays = history.slice(0, 10).map(h => `${h.metadata} (${h.type === 'GAME_WIN' ? 'WIN' : 'LOSS'})`).join(", ");
  
  const prompt = `
    Player's Recent Games: [${recentPlays || 'No games played yet'}]
    CrownPlay Game Library: [${gameNames}]
    
    Task: Suggest exactly ONE game from the library that this player would enjoy next based on their history. 
    If they have a lot of wins, suggest something bold. If they haven't played, suggest a classic.
    Be very specific about WHY it matches their history.
    
    Format your response EXACTLY like this:
    GAME_NAME|REASON
  `;
  
  const result = await generateGeminiResponse(prompt, "You are an elite AI concierge who knows exactly what players want based on their behavioral history. Be classy, data-driven, and persuasive.");
  const [name, reason] = result.split("|");
  return { 
    name: name.trim(), 
    reason: reason?.trim() || "Our royal analytics suggest you'll find great fortune here." 
  };
};
