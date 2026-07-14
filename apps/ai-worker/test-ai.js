import { generateText } from './vertexClient.js';

async function testConnection() {
  console.log("⏳ Gemini (Vertex AI) से कनेक्ट किया जा रहा है...");
  try {
    const response = await generateText("Hello! Say 'Vertex AI is working' in one line.");
    console.log("🎉 Response received successfully!");
    console.log("👉 AI Says:", response);
  } catch (error) {
    console.error("❌ Connection Test Failed!");
  }
}

testConnection();