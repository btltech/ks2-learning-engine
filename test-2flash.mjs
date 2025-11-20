import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAeEyNhmI8L54TT2MPPVO3cl-AFF2evI8" });

async function test() {
  console.log("Testing gemini-2.5-flash...\n");
  
  try {
    // Test 1: Topics
    console.log("Test 1: Topics generation...");
    const topicsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List 5 math topics for a 9-year-old UK student",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["topics"]
        }
      }
    });
    console.log("Topics:", JSON.parse(topicsResponse.text).topics);
    
    // Test 2: MiRa Chat
    console.log("\nTest 2: MiRa chat...");
    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "You are MiRa, a friendly robot tutor. A 9-year-old asks: What is a fraction? Keep it short (2 sentences)."
    });
    console.log("MiRa:", chatResponse.text.trim());
    
    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();
