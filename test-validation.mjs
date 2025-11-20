import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAeEyNhmI8L54TT2MPPVO3cl-AFF2evI8" });

async function testTopicsWithLogging() {
  console.log("Testing topics generation with detailed logging...\n");
  
  const startTime = Date.now();
  
  try {
    console.log("Sending request for Maths topics...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List 10 key topics for the subject 'Maths' for a 9-year-old, strictly in line with the UK Department for Education (DfE) National Curriculum for Key Stage 2.\n\nIMPORTANT: Content must be appropriate for children aged 9. Use simple, encouraging language. Avoid any complex, scary, or inappropriate topics.",
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
    console.log(`✅ Response received in ${endTime - startTime}ms\n`);
    
    const parsed = JSON.parse(response.text);
    console.log("Topics received:");
    parsed.topics.forEach((topic, i) => {
      console.log(`  ${i+1}. ${topic}`);
    });
    
  } catch (error) {
    const endTime = Date.now();
    console.error(`❌ Error after ${endTime - startTime}ms:`);
    console.error(error.message);
  }
}

testTopicsWithLogging();
