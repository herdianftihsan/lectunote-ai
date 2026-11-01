// src/lib/gemini.ts
// Google Generative AI Client Initialization (PRD Section 6)

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(apiKey);

// Model standar yang digunakan: gemini-1.5-flash untuk kecepatan dan efisiensi free-tier
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
  },
});
