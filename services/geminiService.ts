import { GoogleGenAI } from "@google/genai";
import { Note } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is currently:", apiKey);
    throw new Error("API Key is missing. If you are on Vercel, please check: 1. You added API_KEY to Env Variables. 2. You REDEPLOYED after adding it. 3. You are checking the correct environment (Preview vs Production).");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateReviewReport = async (notes: Note[]): Promise<string> => {
  if (notes.length === 0) {
    return "No notes provided to generate a report.";
  }

  const ai = getClient();
  
  // Prepare the data for the prompt
  const notesString = JSON.stringify(notes.map(n => ({
    Category: n.category,
    Owner: n.owner,
    Title: n.title,
    Description: n.description,
    Notes: n.content
  })), null, 2);

  const prompt = `
    You are an expert business consultant. I have collected a set of raw notes from a business review meeting. 
    Your task is to analyze these notes and generate a comprehensive, professional Business Review Report.

    Here is the raw data:
    ${notesString}

    Please structure the report as follows using Markdown:
    1. **Executive Summary**: A high-level overview of the main themes found in the notes.
    2. **Detailed Analysis by Function**: Group the insights by "Category" (Direction/Function/Core Capability). For each category, list the owners and their specific contributions/issues.
    3. **Key Risks & Opportunities**: Identify potential risks or growth opportunities mentioned.
    4. **Action Items**: Deduce actionable next steps based on the notes.

    Tone: Professional, objective, and concise.
    Format: Clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate report text.";
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
};