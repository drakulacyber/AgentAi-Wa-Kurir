/**
 * AntiGravity Customer AI Agent - Default Persona & Config
 */
const DEFAULT_CONFIG = {
  agentName: "Bang Jago",
  businessName: "Jualan Sepatu Keren & Apparel",
  agentAge: 22,
  agentHobby: "Nongkrong, dengerin indie pop, & main ML",
  workingHours: "08:00 - 22:00 WIB",
  personaMode: "santuy", // options: santuy, kasual, gaul, logue, formil
  typingSpeedMultiplier: 1.0,
  enableTypingDelay: true,
  enableTypos: true,
  enableAutoTypingSkip: false,
  soundEffects: true,
  autoReply: true,

  // 100% Free AI Engine Integration Config
  apiProvider: "auto", // options: auto, gemini, groq, local
  geminiApiKey: "",
  groqApiKey: "",
  geminiModel: "gemini-1.5-flash",
  groqModel: "llama-3.1-8b-instant",
  enableResponseCache: true
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_CONFIG };
}
