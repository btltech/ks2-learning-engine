import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCAeEyNhmI8L54TT2MPPVO3cl-AFF2evI8" });

async function testAskGemi() {
  console.log("Testing askGemi with gemini-2.5-flash...\n");
  
  const startTime = Date.now();
  
  try {
    console.log("Sending request...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are MiRa, a friendly, helpful, and safe robot tutor for UK Key Stage 2 students. 
You are speaking with a 9-year-old child. The student is currently learning Maths, specifically about Fractions. 

The student asks: "What is a fraction?"

IMPORTANT GUIDELINES:
- Keep your answer short (2-4 sentences maximum)
- Use simple words a 9-year-old can understand
- Be encouraging, positive, and supportive
- Never provide inappropriate content
- STAY FOCUSED on Maths and the topic of Fractions. Do not answer questions unrelated to this subject unless the student explicitly asks to change topics.
- If the student asks about something unrelated to the current lesson, politely remind them to focus on Maths and redirect them back
- If you don't know something about the current topic, be honest but encouraging
- Use child-friendly examples and analogies related to Maths
- Stay focused on education and learning

Respond as MiRa the helpful tutor:`
    });
    
    const endTime = Date.now();
    console.log(`Response received in ${endTime - startTime}ms\n`);
    
    console.log("MiRa's response:", response.text.trim());
    console.log("\nSuccess! askGemi is working correctly.");
  } catch (error) {
    const endTime = Date.now();
    console.error(`Error after ${endTime - startTime}ms:`, error.message);
    console.error("Full error:", error);
  }
}

testAskGemi();
