
import { GoogleGenAI } from "@google/genai";
import { Salesperson, CalculatedMetrics } from '../types';

// Fix: Per coding guidelines, assume API_KEY is present and initialize directly.
// The API key is sourced from the environment variable `process.env.API_KEY`.
// It is assumed to be pre-configured and available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPerformanceSummary = async (salesperson: Salesperson, metrics: CalculatedMetrics): Promise<string> => {
  // Fix: Removed redundant API key check as per guidelines.
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Analyze the following sales data for a salesperson named ${salesperson.name} and provide a concise performance summary in Portuguese.
    The summary should be easy to read, using markdown for formatting (bolding, lists).
    Highlight their strengths, potential weaknesses, and suggest one key area for improvement.

    Key Metrics:
    - Total New Leads: ${metrics.totalLeads}
    - Sales Qualified Leads (SQL): ${metrics.totalSql}
    - Total Contracts Closed: ${metrics.totalContratosFechados}
    - Total Contract Value: R$ ${metrics.valorTotalContratos.toFixed(2)}
    - Total Paid Value: R$ ${metrics.totalPago.toFixed(2)}
    - Conversion Rate (SQL to Closed): ${(metrics.taxaConversao * 100).toFixed(2)}%
    - CPA (Cost per Acquisition - Leads / Signed Contracts): R$ ${metrics.cpa.toFixed(2)}

    Daily data is available but focus on the overall summary. Be encouraging but direct.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};
