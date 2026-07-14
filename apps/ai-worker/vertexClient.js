import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules में __dirname को सपोर्ट करने के लिए
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// रूट फोल्डर (2 लेवल्स ऊपर) से .env फाइल को लोड करने के लिए पाथ सेट करें
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// यह चेक करने के लिए कि एनवायरनमेंट वेरिएबल सही लोड हुआ है या नहीं
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("⚠️ Error: GOOGLE_APPLICATION_CREDENTIALS is not defined in .env");
}

// Vertex AI को इनिशियलाइज़ करें
// यह अपने आप पर्यावरण वेरिएबल से gcp-key.json का पाथ रीड कर लेगा
const vertexAI = new VertexAI({
  project: 'steel-analyst-52407-m6', // आपका प्रोजेक्ट ID
  location: 'us-central1'             // डिफ़ॉल्ट रीजन
});

// Gemini मॉडल को लोड करें (तेज़ और सटीक काम के लिए gemini-1.5-flash सबसे बेस्ट है)
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

/**
 * विज्ञापन या कोई भी टेक्स्ट कंटेंट जनरेट करने का मुख्य फंक्शन
 * @param {string} prompt - AI के लिए निर्देश/प्रॉम्प्ट
 * @returns {Promise<string>} - AI द्वारा जनरेट किया गया टेक्स्ट
 */
export async function generateText(prompt) {
  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const responseResult = await generativeModel.generateContent(request);
    const response = await responseResult.response;
    
    // जनरेट किए गए टेक्स्ट को रिटर्न करें
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("❌ Vertex AI Error:", error);
    throw error;
  }
}