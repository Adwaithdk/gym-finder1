
import { GoogleGenAI } from "@google/genai";
import { Gym } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGymComparisonInsight = async (gyms: Gym[]): Promise<string> => {
  if (gyms.length < 2) return "Select at least two gyms to get a comparison insight.";
  
  const prompt = `
    Compare these gyms in Thrissur and give me a 3-sentence summary of which one is best for different types of users (e.g., serious lifters vs. busy professionals vs. budget seekers).
    
    Gym 1: ${gyms[0].name} (${gyms[0].location}) - Price: ₹${gyms[0].price}/mo, Rating: ${gyms[0].rating}/5, Trainers: ${gyms[0].trainers.join(', ')}.
    Gym 2: ${gyms[1].name} (${gyms[1].location}) - Price: ₹${gyms[1].price}/mo, Rating: ${gyms[1].rating}/5, Trainers: ${gyms[1].trainers.join(', ')}.
    ${gyms[2] ? `Gym 3: ${gyms[2].name} (${gyms[2].location}) - Price: ₹${gyms[2].price}/mo, Rating: ${gyms[2].rating}/5, Trainers: ${gyms[2].trainers.join(', ')}.` : ''}
    
    Focus on the "Review-to-Price" ratio. Make it punchy and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insight at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI trainer is currently busy. Try again later!";
  }
};

export const getAreaMarketInsight = async (area: string, gyms: Gym[]): Promise<string> => {
  if (gyms.length === 0) return "";
  
  const gymDetails = gyms.map(g => `- ${g.name}: ₹${g.price}/mo, Rating: ${g.rating}/5 (${g.reviewCount} reviews), Loc: ${g.location}`).join('\n');
  
  const prompt = `
    You are a local fitness market analyst in Thrissur.
    The user is searching for a place/area: "${area}".
    
    Compare ALL these gyms in this specific area:
    ${gymDetails}
    
    Provide a punchy "Local Battle" summary (max 3 sentences).
    1. Who wins on price?
    2. Who wins on reputation (reviews)?
    3. Final verdict for someone living in "${area}".
    
    Keep the tone sharp, professional, and slightly competitive (like a sports commentator).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};
