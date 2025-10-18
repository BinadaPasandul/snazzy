// utils/aiService.js
// utils/aiService.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simple rule engine for common intents
const rules = {
  greetings: {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response:
      "Hello! 👋 Welcome to Snazzy Support.\n\nHow can I assist you today? I can help with:\n• Refund requests\n• Technical support\n\nOr I can connect you with our staff directly! 😊",
  },
  contact: {
    keywords: [
      "contact",
      "email",
      "phone",
      "call",
      "reach",
      "talk to",
      "speak with",
      "staff email",
      "support email",
      "contact info",
    ],
    response:
      "Here's how you can reach our staff directly:\n\n📧 Email: snazzy@gmail.com\n📞 Phone: 0762625723\n\n⏰ Response Times:\n• Email: Within 24 hours\n• Phone: Mon-Fri, 9 AM - 6 PM\n\nFeel free to reach out through either channel, and our team will be happy to assist you! 💬",
  },
  whyQuestions: {
    keywords: ["why", "why did", "why was", "why is", "how come", "what happened"],
    contextKeywords: [
      "refund",
      "reject",
      "cancel",
      "denied",
      "declined",
      "not approved",
      "failed",
    ],
    response:
      "I understand you're looking for an explanation. 🔍\n\nTo help you better, your request appears to be missing some information. Could you please provide more details about:\n\n1️⃣ Your order number or transaction ID\n2️⃣ The date of your request\n3️⃣ Any Photo evidence \n4️⃣ Additional context about what happened\n\nWith these details, I can look into your specific situation and provide you with a proper explanation. 📋",
  },
  requests: {
    keywords: ["can you", "could you", "i want", "i need", "please", "i would like", "help me"],
    response:
      "Thank you for reaching out! 👋\n\nI've noted your request and our staff will be in touch with you shortly to assist you further.\n\nYou can expect a response within:\n• General inquiries: 24 hours\n• Complex requests: 48 hours\n\nin the meantime You can send us more details to varify your request. Is there anything else I can help you with ? 😊",
  },
  refund: {
    keywords: ["refund", "return", "money back", "get my money"],
    excludeKeywords: ["why", "rejected", "denied"],
    response:
      "I can help you with refund requests! 💰\n\n📋 Our refund policy:\n• 30-day money-back guarantee\n• Items must be unused and in original packaging\n• Refunds processed within 5-7 business days\n\nTo process your refund, please provide:\n1️⃣ Order number\n2️⃣ Reason for refund\n3️⃣ Photos (if applicable)\n\nOr would you like me to connect you with our staff at snazzy@gmail.com? 📧",
  },
};

const includesAny = (text, arr) => arr?.some((k) => text.includes(k));
const removePunctuation = (s) => s.replace(/[\p{P}\p{S}]/gu, " ").replace(/\s+/g, " ").trim();

export async function askAI(message) {
  try {
    const raw = message || "";
    const text = removePunctuation(raw.toLowerCase());

    // 1) Greetings first
    if (includesAny(text, rules.greetings.keywords)) {
      return rules.greetings.response;
    }

    // 2) Contact info
    if (includesAny(text, rules.contact.keywords)) {
      return rules.contact.response;
    }

    // 3) "Why" questions about refunds
    if (
      includesAny(text, rules.whyQuestions.keywords) &&
      includesAny(text, rules.whyQuestions.contextKeywords)
    ) {
      return rules.whyQuestions.response;
    }

    // 4) Requests like "can you", "could you", "i want"
    if (includesAny(text, rules.requests.keywords)) {
      return rules.requests.response;
    }

    // 5) General refund intent (not why)
    if (
      includesAny(text, rules.refund.keywords) &&
      !includesAny(text, rules.refund.excludeKeywords)
    ) {
      return rules.refund.response;
    }

    // Fallback to LLM
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a concise, helpful support assistant for Snazzy." },
        { role: "user", content: raw },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err.message);
    return "⚠️ AI is currently unavailable. Customer support will be in touch shortly.";
  }
}