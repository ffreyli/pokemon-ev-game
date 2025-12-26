import { GoogleGenAI, Type } from "@google/genai";
import { Pokemon, StatName } from "../types";

export const getAICoaching = async (pokemon: Pokemon): Promise<string> => {
  // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a professional Pokemon EV Trainer coach. 
    Analyze this Pokemon:
    - Name: ${pokemon.nickname} (${pokemon.species})
    - Current Level: ${pokemon.level}
    - Current EVs: HP:${pokemon.evs.hp}, Atk:${pokemon.evs.attack}, Def:${pokemon.evs.defense}, SpA:${pokemon.evs.spAttack}, SpD:${pokemon.evs.spDefense}, Spe:${pokemon.evs.speed}
    
    Provide a concise (2-3 sentences) strategic suggestion for their EV spread based on the species' natural strengths.
    If the EVs are already maxed, congratulate the trainer on a specific build (e.g., Sweeper, Tank).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        // Fix: Removed maxOutputTokens to follow recommended guidelines when thinking budget is not specified
      }
    });
    return response.text || "I'm sensing great potential in this Pokemon! Keep training hard.";
  } catch (error) {
    console.error("Gemini Coaching Error:", error);
    return "The spirits of the Pokemon League are currently silent. Continue your training journey!";
  }
};

export const generatePokemonDescription = async (species: string): Promise<string> => {
  // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a short, immersive pokedex-style description for a ${species}. Focus on its personality and training potential. Max 20 words.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "A loyal companion ready for battle.";
  } catch {
    return "A remarkable Pokemon with unique characteristics.";
  }
};