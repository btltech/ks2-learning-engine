import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAeEyNhmI8L54TT2MPPVO3cl-AFF2evI8" });

async function listModels() {
  try {
    const models = await ai.models.list();
    console.log("Available models:");
    models.forEach(model => {
      if (model.name.includes('gemini')) {
        console.log(`- ${model.name}`);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
