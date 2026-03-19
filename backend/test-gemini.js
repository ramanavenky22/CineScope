const { GoogleGenAI } = require('@google/genai');

try {
  const ai = new GoogleGenAI({ apiKey: 'fake-key' });
  console.log("Success instantiating!");
} catch (e) {
  console.error(e);
}
