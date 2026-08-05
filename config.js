/**
 * AntiGravity Customer AI Agent - Default Persona & Config
 */
const DEFAULT_CONFIG = {
  agentName: "Agent Ai Layanan",
  businessName: "Layanan Pelanggan & E-Commerce",
  agentAge: 24,
  agentHobby: "Nongkrong, dengerin music, & bantu customer",
  workingHours: "08:00 - 22:00 WIB",
  personaMode: "santuy", // options: santuy, kasual, gaul, logue, formil
  typingSpeedMultiplier: 1.0,
  enableTypingDelay: true,
  enableTypos: true,
  enableAutoTypingSkip: false,
  soundEffects: true,
  autoReply: true,

  // 100% Free AI Engine Integration Config
  apiProvider: "gemini", // options: auto, gemini, groq, local
  geminiApiKey: "AQ.Ab8RN6Lqn9wjanRtQBt3xoIFzPQsuEWVBGCEGWGnW-znp7Qvng",
  telegramBotToken: "8530097732:AAFaGlPj3kDAT-66ZtfEcCQ03IqoEpekC00",
  groqApiKey: "",
  geminiModel: "gemini-1.5-flash",
  groqModel: "llama-3.1-8b-instant",
  enableResponseCache: true
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_CONFIG };
}
