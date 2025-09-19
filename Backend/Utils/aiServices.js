// utils/aiService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAI(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or gpt-4 if available
      messages: [{ role: "user", content: message }],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err.message);
    return "⚠️ AI is currently unavailable. Customer support will be in touch shortly.";
  }
}
