import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAeEyNhmI8L54TT2MPPVO3cl-AFF2evI8" });

async function testTopics() {
  console.log("Testing Gemini 2.5-flash API for English topics...\n");
  
  const startTime = Date.now();
  
  try {
    console.log("Sending request...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List 10 key topics for the subject 'English' for a 9-year-old, strictly in line with the UK Department for Education (DfE) National Curriculum for Key Stage 2.\n\nIMPORTANT: Content must be appropriate for children aged 9. Use simple, encouraging language. Avoid any complex, scary, or inappropriate topics.",
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
    
    const endTime = Date.now();
    console.log(`Response received in ${endTime - startTime}ms\n`);
    
    const parsed = JSON.parse(response.text);
    console.log("Topics:", JSON.stringify(parsed.topics, null, 2));
    console.log("\nSuccess! API is working correctly.");
  } catch (error) {
    const endTime = Date.now();
    console.error(`Error after ${endTime - startTime}ms:`, error.message);
    console.error("Full error:", error);
  }
}

testTopics();
